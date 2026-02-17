/* ==========================================
   FRC Team #10689 Kağıthane — Navbar Logic
   ========================================== */

(function () {
    'use strict';

    // --- Translations ---
    const translations = {
        nav: {
            about: { tr: 'Hakkımızda', en: 'About' },
            team: { tr: 'Takım', en: 'Team' },
            blog: { tr: 'Blog', en: 'Blog' },
            contact: { tr: 'İletişim', en: 'Contact' }
        },
        pageTitle: {
            index: { tr: 'Ana Sayfa', en: 'Kağıthane ' },
            about: { tr: 'Hakkımızda', en: 'About' },
            team: { tr: 'Takım', en: 'Team' },
            blog: { tr: 'Blog', en: 'Blog' },
            contact: { tr: 'İletişim', en: 'Contact' }
        },
        footer: {
            teamDesc: {
                tr: 'İstanbul\'un Kağıthane ilçesinde kurulan FRC robotik takımı. Mühendislik, inovasyon ve takım ruhuyla geleceğe adım atıyoruz.',
                en: 'An FRC robotics team founded in Kağıthane, Istanbul. Stepping into the future with engineering, innovation and teamwork.'
            },
            quickLinks: { tr: 'Hızlı Bağlantılar', en: 'Quick Links' },
            followUs: { tr: 'Bizi Takip Edin', en: 'Follow Us' },
            rights: { tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' },
            madeWith: { tr: 'tarafından yapıldı', en: 'made by' }
        }
    };

    // --- State ---
    let currentLang = localStorage.getItem('site-lang') || 'tr';
    let isMenuOpen = false;

    // --- Get current page ---
    function getActivePage() {
        const segments = window.location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        const last = segments[segments.length - 1] || 'index';
        // If last segment is index.html or empty, we're on the home page
        if (last === 'index.html' || last === 'index') {
            // Check if we're in a subfolder (like /about/index.html)
            if (segments.length >= 2 && segments[segments.length - 2] !== '') {
                const parent = segments[segments.length - 2];
                if (['about', 'team', 'blog', 'contact'].includes(parent)) {
                    return parent;
                }
            }
            return 'index';
        }
        return last.replace('.html', '');
    }

    // --- Get base URL for assets ---
    function getBaseUrl() {
        const page = getActivePage();
        return page === 'index' ? '' : '../';
    }

    // --- Build Navbar HTML ---
    function buildNavbar() {
        const active = getActivePage();
        const wrapper = document.createElement('div');
        wrapper.className = 'navbar-wrapper';
        wrapper.id = 'navbar-wrapper';

        const base = getBaseUrl();

        wrapper.innerHTML = `
            <nav class="navbar" id="navbar">
                <a href="${base}./" class="navbar-brand">
                    <img src="${base}img/png.png" alt="Kağıthane #10689" class="navbar-logo" id="navbar-logo-img">
                    <span class="navbar-number">10689</span>
                </a>
                <ul class="navbar-links" id="navbar-links">
                    <li><a href="${base}about/" class="${active === 'about' ? 'active' : ''}" data-tr="${translations.nav.about.tr}" data-en="${translations.nav.about.en}">${translations.nav.about[currentLang]}</a></li>
                    <li><a href="${base}team/" class="${active === 'team' ? 'active' : ''}" data-tr="${translations.nav.team.tr}" data-en="${translations.nav.team.en}">${translations.nav.team[currentLang]}</a></li>
                    <li><a href="${base}blog/" class="${active === 'blog' ? 'active' : ''}" data-tr="${translations.nav.blog.tr}" data-en="${translations.nav.blog.en}">${translations.nav.blog[currentLang]}</a></li>
                    <li class="nav-contact-mobile"><a href="${base}contact/" class="${active === 'contact' ? 'active' : ''}" data-tr="${translations.nav.contact.tr}" data-en="${translations.nav.contact.en}">${translations.nav.contact[currentLang]}</a></li>
                </ul>
                <div style="display:flex;align-items:center;gap:10px;">
                    <button class="lang-toggle" id="lang-toggle">${currentLang === 'tr' ? 'EN' : 'TR'}</button>
                    <a href="${base}contact/" class="navbar-contact" data-tr="${translations.nav.contact.tr}" data-en="${translations.nav.contact.en}">${translations.nav.contact[currentLang]}</a>
                    <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
        `;

        document.body.prepend(wrapper);
    }

    // --- Build Footer HTML ---
    function buildFooter() {
        const page = getActivePage();
        // Don't add footer to home page
        if (page === 'index') return;

        // Remove any existing static footer
        var oldFooter = document.querySelector('.footer');
        if (oldFooter) oldFooter.remove();

        var ft = translations.footer;
        var nv = translations.nav;
        var lang = currentLang;

        var footerEl = document.createElement('footer');
        footerEl.className = 'footer-pro';
        var base = getBaseUrl();

        footerEl.innerHTML = `
            <div class="footer-pro-inner">
                <div class="footer-col footer-col-brand">
                    <a href="${base}./" class="footer-logo">
                        <img src="${base}img/png.png" alt="Kağıthane #10689">
                        <span>Kağıthane <strong>#10689</strong></span>
                    </a>
                    <p class="footer-desc" data-tr="${ft.teamDesc.tr}" data-en="${ft.teamDesc.en}">${ft.teamDesc[lang]}</p>
                </div>
                <div class="footer-col">
                    <h4 data-tr="${ft.quickLinks.tr}" data-en="${ft.quickLinks.en}">${ft.quickLinks[lang]}</h4>
                    <ul class="footer-links">
                        <li><a href="${base}about/" data-tr="${nv.about.tr}" data-en="${nv.about.en}">${nv.about[lang]}</a></li>
                        <li><a href="${base}team/" data-tr="${nv.team.tr}" data-en="${nv.team.en}">${nv.team[lang]}</a></li>
                        <li><a href="${base}blog/" data-tr="${nv.blog.tr}" data-en="${nv.blog.en}">${nv.blog[lang]}</a></li>
                        <li><a href="${base}contact/" data-tr="${nv.contact.tr}" data-en="${nv.contact.en}">${nv.contact[lang]}</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 data-tr="${ft.followUs.tr}" data-en="${ft.followUs.en}">${ft.followUs[lang]}</h4>
                    <div class="footer-social">
                        <a href="https://www.instagram.com/kagithane10689/" target="_blank" rel="noopener" aria-label="Instagram" class="footer-social-link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2026 Kağıthane #10689 — <span data-tr="${ft.rights.tr}" data-en="${ft.rights.en}">${ft.rights[lang]}</span></p>
                <p class="footer-made">𝔈 <span data-tr="${ft.madeWith.tr}" data-en="${ft.madeWith.en}">${ft.madeWith[lang]}</span></p>
            </div>
        `;

        // Insert before closing of page-bg
        var pageBg = document.querySelector('.page-bg');
        if (pageBg) {
            pageBg.appendChild(footerEl);
        }
    }

    // --- Scroll Handler (navbar shrink) ---
    function initScrollHandler() {
        const page = getActivePage();
        // Home page has no scroll so navbar always stays expanded
        if (page === 'index') return;

        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.scrollY > 50) {
                        navbar.classList.add('compact');
                    } else {
                        navbar.classList.remove('compact');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // --- Update Page Title ---
    function updatePageTitle() {
        const page = getActivePage();
        const titleData = translations.pageTitle[page];
        if (titleData) {
            document.title = titleData[currentLang] + ' | 10689';
        }
    }

    // --- Language Toggle ---
    function initLanguageToggle() {
        const btn = document.getElementById('lang-toggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            currentLang = currentLang === 'tr' ? 'en' : 'tr';
            localStorage.setItem('site-lang', currentLang);
            btn.textContent = currentLang === 'tr' ? 'EN' : 'TR';

            // Update all translatable elements
            document.querySelectorAll('[data-tr][data-en]').forEach(function (el) {
                el.textContent = el.getAttribute('data-' + currentLang);
            });

            // Update page title
            updatePageTitle();
        });
    }

    // --- Mobile Menu ---
    function initMobileMenu() {
        const toggle = document.getElementById('menu-toggle');
        const links = document.getElementById('navbar-links');
        if (!toggle || !links) return;

        toggle.addEventListener('click', function () {
            isMenuOpen = !isMenuOpen;
            toggle.classList.toggle('active', isMenuOpen);
            links.classList.toggle('open', isMenuOpen);
        });

        // Close menu when clicking a link
        links.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                isMenuOpen = false;
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });
    }

    // --- Scroll Reveal ---
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    }

    // --- Init ---
    function init() {
        buildNavbar();
        buildFooter();
        initScrollHandler();
        initLanguageToggle();
        initMobileMenu();
        initScrollReveal();

        // Apply language on load to all elements with data attributes
        document.querySelectorAll('[data-tr][data-en]').forEach(function (el) {
            el.textContent = el.getAttribute('data-' + currentLang);
        });

        // Set page title based on current language
        updatePageTitle();

        // --- Content Protection ---
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });
        document.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'C' || e.key === 'U' || e.key === 'S')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
                e.key === 'F12') {
                e.preventDefault();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
