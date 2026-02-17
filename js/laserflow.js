/* ==========================================
   LaserFlow — WebGL Animated Background
   Vanilla JS recreation of @react-bits LaserFlow
   ========================================== */

(function () {
    'use strict';

    const VERTEX_SHADER = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const FRAGMENT_SHADER = `
        precision highp float;

        uniform float u_time;
        uniform vec2  u_resolution;
        uniform vec3  u_color;
        uniform float u_wispDensity;
        uniform float u_flowSpeed;
        uniform float u_verticalSizing;
        uniform float u_horizontalSizing;
        uniform float u_fogIntensity;
        uniform float u_fogScale;
        uniform float u_wispSpeed;
        uniform float u_wispIntensity;
        uniform float u_flowStrength;
        uniform float u_decay;
        uniform float u_hBeamOffset;
        uniform float u_vBeamOffset;

        // ---  hash / noise helpers ---
        float hash(vec2 p) {
            float h = dot(p, vec2(127.1, 311.7));
            return fract(sin(h) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
            for (int i = 0; i < 6; i++) {
                v += a * noise(p);
                p = rot * p * 2.0 + vec2(100.0);
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            vec2 p = (uv - 0.5) * 2.0;

            // Aspect ratio correction
            p.x *= u_resolution.x / u_resolution.y;

            // Apply beam offsets
            p.x += u_hBeamOffset;
            p.y += u_vBeamOffset;

            float t = u_time * u_flowSpeed;

            // ---- Flowing wisps / beams ----
            float beamH = 0.0;
            for (float i = 1.0; i <= 5.0; i++) {
                float freq = i * u_wispDensity;
                float phase = t * (0.3 + i * 0.12) + i * 1.618;
                float wave = sin(p.x * freq * u_horizontalSizing + phase) * 0.5 + 0.5;
                float beam = exp(-pow(abs(p.y - wave * 0.4 + 0.2) * u_verticalSizing, 2.0) * (3.0 + i));
                beamH += beam * (u_wispIntensity / (5.0 * i * 0.8));
            }

            // Vertical wisps
            float beamV = 0.0;
            for (float i = 1.0; i <= 3.0; i++) {
                float freq = i * u_wispDensity * 0.7;
                float phase = t * (0.2 + i * 0.1) + i * 2.318;
                float wave = sin(p.y * freq * u_verticalSizing + phase) * 0.5 + 0.5;
                float beam = exp(-pow(abs(p.x - wave * 0.3) * u_horizontalSizing, 2.0) * (4.0 + i));
                beamV += beam * (u_wispIntensity / (8.0 * i));
            }

            float beams = beamH + beamV * 0.6;

            // ---- Flow distortion ----
            float flow = fbm(p * 1.5 + t * 0.15) * u_flowStrength;
            beams += flow * 0.15;

            // ---- Fog layer ----
            float fog = fbm(p * u_fogScale + vec2(t * 0.08, t * 0.05));
            fog = fog * u_fogIntensity * 0.35;

            // ---- Wisp shimmer ----
            float shimmer = fbm(p * 3.0 + vec2(t * u_wispSpeed * 0.01));
            beams *= 0.8 + shimmer * 0.4;

            // ---- Compose color ----
            float intensity = beams + fog;

            // Edge vignette / decay
            float vignette = 1.0 - pow(length(uv - 0.5) * u_decay, 2.0);
            intensity *= max(vignette, 0.0);

            // Color ramp — base is near‑black, highlight is the user color
            vec3 baseColor = u_color * 0.1;
            vec3 highlight = u_color * 1.8 + vec3(0.15, 0.2, 0.4);
            vec3 col = mix(baseColor, highlight, intensity);

            // Subtle blue-white core on bright beams
            vec3 core = vec3(0.6, 0.7, 1.0);
            col = mix(col, core, smoothstep(0.6, 1.2, beams) * 0.35);

            // Background darkness
            col = max(col, vec3(0.0));

            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function createLaserFlow(canvas, opts) {
        opts = opts || {};

        var color = hexToVec3(opts.color || '#000a3d');
        var wispDensity = opts.wispDensity || 1.3;
        var flowSpeed = opts.flowSpeed || 0.65;
        var verticalSizing = opts.verticalSizing || 2.9;
        var horizontalSizing = opts.horizontalSizing || 2.3;
        var fogIntensity = opts.fogIntensity || 1.0;
        var fogScale = opts.fogScale || 0.4;
        var wispSpeed = opts.wispSpeed || 30;
        var wispIntensity = opts.wispIntensity || 12;
        var flowStrength = opts.flowStrength || 0;
        var decay = opts.decay || 1.4;
        var hBeamOffset = opts.horizontalBeamOffset || 0;
        var vBeamOffset = opts.verticalBeamOffset || -0.5;

        var gl = canvas.getContext('webgl', { alpha: false, antialias: false });
        if (!gl) { console.warn('WebGL not supported'); return; }

        // Compile shaders
        function compileShader(src, type) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(s));
                gl.deleteShader(s);
                return null;
            }
            return s;
        }

        var vs = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER);
        var fs = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(prog));
            return;
        }
        gl.useProgram(prog);

        // Fullscreen quad
        var posAttr = gl.getAttribLocation(prog, 'a_position');
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            1, -1, 1, 1, -1, 1
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        var uTime = gl.getUniformLocation(prog, 'u_time');
        var uRes = gl.getUniformLocation(prog, 'u_resolution');
        var uColor = gl.getUniformLocation(prog, 'u_color');
        var uWD = gl.getUniformLocation(prog, 'u_wispDensity');
        var uFS = gl.getUniformLocation(prog, 'u_flowSpeed');
        var uVS = gl.getUniformLocation(prog, 'u_verticalSizing');
        var uHS = gl.getUniformLocation(prog, 'u_horizontalSizing');
        var uFI = gl.getUniformLocation(prog, 'u_fogIntensity');
        var uFSc = gl.getUniformLocation(prog, 'u_fogScale');
        var uWSp = gl.getUniformLocation(prog, 'u_wispSpeed');
        var uWI = gl.getUniformLocation(prog, 'u_wispIntensity');
        var uFSt = gl.getUniformLocation(prog, 'u_flowStrength');
        var uDec = gl.getUniformLocation(prog, 'u_decay');
        var uHBO = gl.getUniformLocation(prog, 'u_hBeamOffset');
        var uVBO = gl.getUniformLocation(prog, 'u_vBeamOffset');

        // Set static uniforms
        gl.uniform3f(uColor, color[0], color[1], color[2]);
        gl.uniform1f(uWD, wispDensity);
        gl.uniform1f(uFS, flowSpeed);
        gl.uniform1f(uVS, verticalSizing);
        gl.uniform1f(uHS, horizontalSizing);
        gl.uniform1f(uFI, fogIntensity);
        gl.uniform1f(uFSc, fogScale);
        gl.uniform1f(uWSp, wispSpeed);
        gl.uniform1f(uWI, wispIntensity);
        gl.uniform1f(uFSt, flowStrength);
        gl.uniform1f(uDec, decay);
        gl.uniform1f(uHBO, hBeamOffset);
        gl.uniform1f(uVBO, vBeamOffset);

        var startTime = Date.now();
        var animId;

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = canvas.clientWidth * dpr;
            var h = canvas.clientHeight * dpr;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        }

        function render() {
            resize();
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(uTime, (Date.now() - startTime) * 0.001);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animId = requestAnimationFrame(render);
        }

        render();

        return {
            destroy: function () {
                cancelAnimationFrame(animId);
                gl.deleteProgram(prog);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
                gl.deleteBuffer(buf);
            }
        };
    }

    function hexToVec3(hex) {
        hex = hex.replace('#', '');
        return [
            parseInt(hex.substring(0, 2), 16) / 255,
            parseInt(hex.substring(2, 4), 16) / 255,
            parseInt(hex.substring(4, 6), 16) / 255
        ];
    }

    // Auto-init: find canvas with id="laserflow"
    function init() {
        var canvas = document.getElementById('laserflow');
        if (!canvas) return;

        createLaserFlow(canvas, {
            color: '#000a3d',
            wispDensity: 1.3,
            flowSpeed: 0.65,
            verticalSizing: 2.9,
            horizontalSizing: 2.3,
            fogIntensity: 1,
            fogScale: 0.4,
            wispSpeed: 30,
            wispIntensity: 12,
            flowStrength: 0,
            decay: 1.4,
            horizontalBeamOffset: 0,
            verticalBeamOffset: -0.5
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.LaserFlow = createLaserFlow;
})();
