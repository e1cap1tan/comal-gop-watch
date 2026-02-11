/**
 * Navigation test — validates all internal href values in HTML files
 * point to existing files (or valid anchors/roots).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function findHtmlFiles(dir, files) {
    files = files || [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !['node_modules', '.git', 'test'].includes(entry.name)) {
            findHtmlFiles(full, files);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(full);
        }
    }
    return files;
}

function extractHrefs(html) {
    const hrefRegex = /href="([^"]+)"/g;
    const hrefs = [];
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
        hrefs.push(match[1]);
    }
    return hrefs;
}

function isExternal(href) {
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
}

function isAnchor(href) {
    return href.startsWith('#');
}

const htmlFiles = findHtmlFiles(ROOT);

describe('All HTML files found', function () {
    it('should find index.html', function () {
        assert.ok(htmlFiles.some(f => f.endsWith('index.html')));
    });

    it('should find feed pages', function () {
        assert.ok(htmlFiles.some(f => f.includes('feeds/candidates.html')));
        assert.ok(htmlFiles.some(f => f.includes('feeds/policy.html')));
        assert.ok(htmlFiles.some(f => f.includes('feeds/business.html')));
    });

    it('should find profile pages', function () {
        const profiles = htmlFiles.filter(f => f.includes('/profiles/'));
        assert.ok(profiles.length >= 14, 'Expected at least 14 profile pages, found ' + profiles.length);
    });
});

describe('Internal link validation', function () {
    for (const htmlFile of htmlFiles) {
        const relPath = path.relative(ROOT, htmlFile);

        it('all links in ' + relPath + ' point to existing files', function () {
            const html = fs.readFileSync(htmlFile, 'utf-8');
            const hrefs = extractHrefs(html);
            const fileDir = path.dirname(htmlFile);
            const broken = [];

            for (const href of hrefs) {
                if (isExternal(href) || isAnchor(href)) continue;

                // Strip query and hash
                let cleanHref = href.split('?')[0].split('#')[0];
                if (!cleanHref) continue;

                // Resolve path
                let resolved;
                if (cleanHref.startsWith('/')) {
                    // Absolute path from root
                    resolved = path.join(ROOT, cleanHref);
                } else if (cleanHref.startsWith('../')) {
                    // Relative path
                    resolved = path.resolve(fileDir, cleanHref);
                } else {
                    // Relative path (same dir or subdir)
                    resolved = path.resolve(fileDir, cleanHref);
                }

                // For directory paths, check for index.html
                if (cleanHref.endsWith('/')) {
                    resolved = path.join(resolved, 'index.html');
                }

                // Only validate .html, .css, .js file links (skip font/image CDN relative)
                const ext = path.extname(resolved);
                if (['.html', '.css', '.js', '.json'].includes(ext)) {
                    if (!fs.existsSync(resolved)) {
                        broken.push(href + ' -> ' + resolved);
                    }
                }
            }

            assert.deepStrictEqual(broken, [], 'Broken links in ' + relPath + ':\n' + broken.join('\n'));
        });
    }
});

describe('Homepage View All links', function () {
    it('homepage has View All links to all three feed pages', function () {
        const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
        assert.ok(html.includes('/feeds/candidates.html'), 'Missing candidates View All link');
        assert.ok(html.includes('/feeds/policy.html'), 'Missing policy View All link');
        assert.ok(html.includes('/feeds/business.html'), 'Missing business View All link');
    });
});

describe('Feed pages have back/home navigation', function () {
    const feedPages = [
        'feeds/candidates.html',
        'feeds/policy.html',
        'feeds/business.html'
    ];

    for (const page of feedPages) {
        it(page + ' has breadcrumb link back to home', function () {
            const html = fs.readFileSync(path.join(ROOT, page), 'utf-8');
            // Should have a link to home in breadcrumb or nav
            const hasHomeLink = html.includes('href="/"') || html.includes('href="/index.html"');
            assert.ok(hasHomeLink, page + ' should link back to home');
        });
    }
});

describe('Profile pages have back navigation', function () {
    const profileFiles = htmlFiles.filter(f => f.includes('/profiles/'));

    for (const profileFile of profileFiles) {
        const relPath = path.relative(ROOT, profileFile);

        it(relPath + ' has back link to home', function () {
            const html = fs.readFileSync(profileFile, 'utf-8');
            const hasBackLink = html.includes('Back to Home') || html.includes('back-link');
            assert.ok(hasBackLink, relPath + ' should have a back link');
        });
    }
});

describe('Officials in officials.json have matching profile pages', function () {
    it('every official slug has a profile HTML file', function () {
        const officials = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/officials.json'), 'utf-8'));
        const missing = [];
        for (const official of officials.current_officials || []) {
            const profilePath = path.join(ROOT, 'profiles', official.slug + '.html');
            if (!fs.existsSync(profilePath)) {
                missing.push(official.slug);
            }
        }
        assert.deepStrictEqual(missing, [], 'Missing profile pages for: ' + missing.join(', '));
    });
});

describe('Mobile menu button present on all pages', function () {
    it('layout.js renders mobile menu button', function () {
        const layout = require(path.join(ROOT, 'js/layout.js'));
        const navHtml = layout.renderNav();
        assert.ok(navHtml.includes('mobile-menu-btn'), 'Nav should contain mobile menu button');
        assert.ok(navHtml.includes('nav-links'), 'Nav should contain nav-links');
    });
});

describe('No horizontal overflow CSS issues', function () {
    it('shared.css has overflow-x: hidden on html, body', function () {
        const css = fs.readFileSync(path.join(ROOT, 'css/shared.css'), 'utf-8');
        assert.ok(css.includes('overflow-x: hidden'), 'shared.css should prevent horizontal overflow');
    });

    it('shared.css has overflow-wrap: break-word on body', function () {
        const css = fs.readFileSync(path.join(ROOT, 'css/shared.css'), 'utf-8');
        assert.ok(css.includes('overflow-wrap: break-word'), 'shared.css should have overflow-wrap');
    });

    it('all pages include shared.css', function () {
        for (const htmlFile of htmlFiles) {
            const html = fs.readFileSync(htmlFile, 'utf-8');
            const hasSharedCss = html.includes('shared.css');
            const relPath = path.relative(ROOT, htmlFile);
            assert.ok(hasSharedCss, relPath + ' should include shared.css');
        }
    });

    it('all pages have viewport meta tag', function () {
        for (const htmlFile of htmlFiles) {
            const html = fs.readFileSync(htmlFile, 'utf-8');
            const relPath = path.relative(ROOT, htmlFile);
            assert.ok(html.includes('viewport'), relPath + ' should have viewport meta tag');
        }
    });
});
