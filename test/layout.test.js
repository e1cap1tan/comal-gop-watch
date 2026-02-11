const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const layout = require('../js/layout.js');

describe('layout.js — renderNav', function () {
    const html = layout.renderNav();

    it('contains Home link', function () {
        assert.ok(html.includes('href="/"'), 'Missing Home link');
        assert.ok(html.includes('>Home<'), 'Missing Home label');
    });

    it('contains Candidates feed link', function () {
        assert.ok(html.includes('href="/feeds/candidates.html"'), 'Missing Candidates link');
        assert.ok(html.includes('>Candidates<'), 'Missing Candidates label');
    });

    it('contains Policy feed link', function () {
        assert.ok(html.includes('href="/feeds/policy.html"'), 'Missing Policy link');
        assert.ok(html.includes('>Policy<'), 'Missing Policy label');
    });

    it('contains Business Watch feed link', function () {
        assert.ok(html.includes('href="/feeds/business.html"'), 'Missing Business Watch link');
        assert.ok(html.includes('>Business Watch<'), 'Missing Business Watch label');
    });

    it('contains logo with site branding', function () {
        assert.ok(html.includes('class="logo"'), 'Missing logo class');
        assert.ok(html.includes('Comal'), 'Missing Comal in logo');
        assert.ok(html.includes('GOP'), 'Missing GOP in logo');
    });

    it('contains mobile menu button', function () {
        assert.ok(html.includes('mobile-menu-btn'), 'Missing mobile menu button');
        assert.ok(html.includes('aria-label="Toggle menu"'), 'Missing aria-label');
    });

    it('contains top-bar', function () {
        assert.ok(html.includes('class="top-bar"'), 'Missing top bar');
    });

    it('renders nav-links list with correct id', function () {
        assert.ok(html.includes('id="nav-links"'), 'Missing nav-links id');
    });
});

describe('layout.js — renderFooter', function () {
    const html = layout.renderFooter();

    it('contains footer-brand', function () {
        assert.ok(html.includes('class="footer-brand"'), 'Missing footer-brand');
        assert.ok(html.includes('Comal GOP Watch'), 'Missing site name in footer');
    });

    it('contains copyright with current year', function () {
        const year = new Date().getFullYear();
        assert.ok(html.includes('&copy; ' + year), 'Missing copyright year');
    });

    it('contains last-updated text', function () {
        assert.ok(html.includes('Last updated:'), 'Missing last-updated text');
    });
});

describe('layout.js — NAV_LINKS', function () {
    it('exports 4 navigation links', function () {
        assert.equal(layout.NAV_LINKS.length, 4);
    });

    it('each link has label and href', function () {
        layout.NAV_LINKS.forEach(function (link) {
            assert.ok(link.label, 'Missing label');
            assert.ok(link.href, 'Missing href');
        });
    });
});
