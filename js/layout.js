/* ══════════════════════════════════════════
   Comal County GOP Watch — Layout Components
   Shared nav and footer injected into all pages
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    var NAV_LINKS = [
        { label: 'Home', href: '/' },
        { label: 'Candidates', href: '/feeds/candidates.html' },
        { label: 'Policy', href: '/feeds/policy.html' },
        { label: 'Business Watch', href: '/feeds/business.html' }
    ];

    function renderNav() {
        var linksHtml = NAV_LINKS.map(function (link) {
            return '<li><a href="' + link.href + '">' + link.label + '</a></li>';
        }).join('\n            ');

        return '<div class="top-bar">Comal County GOP Watch &mdash; Keeping Local Voters Informed</div>\n' +
            '<nav>\n' +
            '  <div class="nav-inner">\n' +
            '    <a href="/" class="logo">Comal <span>GOP</span> Watch</a>\n' +
            '    <ul class="nav-links" id="nav-links">\n' +
            '        ' + linksHtml + '\n' +
            '    </ul>\n' +
            '    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">&#9776;</button>\n' +
            '  </div>\n' +
            '</nav>';
    }

    function renderFooter() {
        var year = new Date().getFullYear();
        return '<footer>\n' +
            '  <div class="footer-brand">Comal GOP Watch</div>\n' +
            '  <p>&copy; ' + year + ' Comal County GOP Watch. Independent voter resource.</p>\n' +
            '  <p style="margin-top: 8px; font-size: 12px;">Last updated: ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</p>\n' +
            '</footer>';
    }

    function initMobileMenu() {
        var btn = document.getElementById('mobile-menu-btn');
        var links = document.getElementById('nav-links');
        if (btn && links) {
            btn.addEventListener('click', function () {
                links.classList.toggle('open');
            });
        }
    }

    function initLayout() {
        var navEl = document.getElementById('site-nav');
        var footerEl = document.getElementById('site-footer');
        if (navEl) { navEl.innerHTML = renderNav(); }
        if (footerEl) { footerEl.innerHTML = renderFooter(); }
        initMobileMenu();
    }

    // Auto-init on DOMContentLoaded in browser
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initLayout);
        } else {
            initLayout();
        }
    }

    // Export for Node.js testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { renderNav: renderNav, renderFooter: renderFooter, NAV_LINKS: NAV_LINKS, initLayout: initLayout };
    }
})();
