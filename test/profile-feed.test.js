const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { getCandidateSlug, filterByCandidate, renderProfileFeed } = require('../js/profile-feed.js');

// Sample feed data
const sampleEntries = [
    { id: 'cn-001', date: '2026-02-10T12:00:00', title: 'County Judge Vacant', summary: 'Summary 1', source: 'Herald', sourceUrl: 'https://example.com', category: 'county-government', tags: [], relatedCandidate: undefined },
    { id: 'cn-002', date: '2026-02-08T12:00:00', title: 'Five Candidates File', summary: 'Summary 2', source: 'Herald', sourceUrl: 'https://example.com', category: 'elections', tags: [], relatedCandidate: 'neal-linnartz' },
    { id: 'cn-003', date: '2026-02-05T12:00:00', title: 'Isaac Files Bill', summary: 'Summary 3', source: 'Tribune', sourceUrl: 'https://example.com', category: 'legislation', tags: [], relatedCandidate: 'carrie-isaac' },
    { id: 'cn-004', date: '2026-02-01T12:00:00', title: 'Linnartz Budget', summary: 'Summary 4', source: 'Herald', sourceUrl: 'https://example.com', category: 'local-government', tags: [], relatedCandidate: 'neal-linnartz' },
];

describe('getCandidateSlug', () => {
    it('returns slug from data-candidate-slug attribute', () => {
        const mockDoc = {
            body: {
                getAttribute: (attr) => attr === 'data-candidate-slug' ? 'neal-linnartz' : null
            }
        };
        assert.equal(getCandidateSlug(mockDoc), 'neal-linnartz');
    });

    it('returns slug from pathname', () => {
        const mockDoc = {
            body: { getAttribute: () => null },
            location: { pathname: '/profiles/carrie-isaac.html' }
        };
        assert.equal(getCandidateSlug(mockDoc), 'carrie-isaac');
    });

    it('returns null when no document', () => {
        assert.equal(getCandidateSlug(null), null);
    });

    it('prefers data attribute over pathname', () => {
        const mockDoc = {
            body: { getAttribute: (attr) => attr === 'data-candidate-slug' ? 'from-attr' : null },
            location: { pathname: '/profiles/from-path.html' }
        };
        assert.equal(getCandidateSlug(mockDoc), 'from-attr');
    });
});

describe('filterByCandidate', () => {
    it('filters entries by relatedCandidate slug', () => {
        const result = filterByCandidate(sampleEntries, 'neal-linnartz');
        assert.equal(result.length, 2);
        assert.equal(result[0].id, 'cn-002');
        assert.equal(result[1].id, 'cn-004');
    });

    it('returns entries sorted newest-first', () => {
        const result = filterByCandidate(sampleEntries, 'neal-linnartz');
        assert.ok(new Date(result[0].date) >= new Date(result[1].date));
    });

    it('returns empty array for no matches', () => {
        const result = filterByCandidate(sampleEntries, 'nobody');
        assert.equal(result.length, 0);
    });

    it('returns empty array for null entries', () => {
        assert.deepEqual(filterByCandidate(null, 'test'), []);
    });

    it('returns empty array for null slug', () => {
        assert.deepEqual(filterByCandidate(sampleEntries, null), []);
    });

    it('filters single candidate correctly', () => {
        const result = filterByCandidate(sampleEntries, 'carrie-isaac');
        assert.equal(result.length, 1);
        assert.equal(result[0].id, 'cn-003');
    });
});

describe('renderProfileFeed', () => {
    it('renders no-activity message for empty entries', () => {
        const container = {};
        const html = renderProfileFeed([], container);
        assert.ok(html.includes('No recent activity'));
        assert.equal(container.innerHTML, html);
    });

    it('renders no-activity message for null entries', () => {
        const html = renderProfileFeed(null, {});
        assert.ok(html.includes('No recent activity'));
    });

    it('renders feed cards for entries (fallback renderer)', () => {
        const entries = filterByCandidate(sampleEntries, 'neal-linnartz');
        const container = {};
        const html = renderProfileFeed(entries, container);
        assert.ok(html.includes('feed-card'));
        assert.ok(html.includes('Five Candidates File'));
        assert.ok(html.includes('Linnartz Budget'));
        assert.equal(container.innerHTML, html);
    });

    it('includes source links in rendered cards', () => {
        const entries = filterByCandidate(sampleEntries, 'neal-linnartz');
        const html = renderProfileFeed(entries, {});
        assert.ok(html.includes('feed-card-source'));
        assert.ok(html.includes('https://example.com'));
    });

    it('works without container', () => {
        const html = renderProfileFeed([], null);
        assert.ok(html.includes('No recent activity'));
    });
});

describe('Profile HTML structure', () => {
    const profileDir = path.join(__dirname, '..', 'profiles');
    const profileFiles = fs.readdirSync(profileDir).filter(f => f.endsWith('.html'));

    it('found profile pages', () => {
        assert.ok(profileFiles.length >= 18, `Expected at least 18 profiles, got ${profileFiles.length}`);
    });

    for (const file of profileFiles) {
        const slug = file.replace('.html', '');
        const content = fs.readFileSync(path.join(profileDir, file), 'utf-8');

        describe(file, () => {
            it('links to shared.css', () => {
                assert.ok(content.includes('css/shared.css'), `${file} missing shared.css link`);
            });

            it('uses layout.js for nav and footer', () => {
                assert.ok(content.includes('id="site-nav"'), `${file} missing site-nav`);
                assert.ok(content.includes('id="site-footer"'), `${file} missing site-footer`);
                assert.ok(content.includes('js/layout.js'), `${file} missing layout.js`);
            });

            it('has Recent Activity section', () => {
                assert.ok(content.includes('Recent Activity'), `${file} missing Recent Activity section`);
                assert.ok(content.includes('id="candidate-activity"'), `${file} missing candidate-activity container`);
            });

            it('has data-candidate-slug attribute', () => {
                assert.ok(content.includes(`data-candidate-slug="${slug}"`), `${file} missing data-candidate-slug`);
            });

            it('loads profile-feed.js', () => {
                assert.ok(content.includes('js/profile-feed.js'), `${file} missing profile-feed.js`);
            });

            it('does not have old inline nav/footer', () => {
                assert.ok(!content.includes('<div class="top-bar">'), `${file} still has old top-bar`);
                // Check no hardcoded <footer> tag (should use site-footer div)
                assert.ok(!content.includes('</footer>'), `${file} still has hardcoded footer`);
            });

            it('is responsive (no horizontal overflow issues)', () => {
                // Check that profile-header has responsive styles
                assert.ok(content.includes('@media (max-width: 900px)'), `${file} missing responsive media query`);
            });
        });
    }
});
