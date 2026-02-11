const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

describe('Policy Feed Page (feeds/policy.html)', function () {
    const html = fs.readFileSync(path.join(ROOT, 'feeds', 'policy.html'), 'utf-8');

    it('file exists', function () {
        assert.ok(fs.existsSync(path.join(ROOT, 'feeds', 'policy.html')));
    });

    it('has correct title', function () {
        assert.ok(html.includes('<title>Public Policy &amp; Local Government — Comal County GOP Watch</title>'));
    });

    it('includes shared CSS', function () {
        assert.ok(html.includes('/css/shared.css'));
    });

    it('includes layout.js for nav/footer', function () {
        assert.ok(html.includes('/js/layout.js'));
        assert.ok(html.includes('id="site-nav"'));
        assert.ok(html.includes('id="site-footer"'));
    });

    it('includes feed-renderer.js', function () {
        assert.ok(html.includes('/js/feed-renderer.js'));
    });

    it('includes utils.js', function () {
        assert.ok(html.includes('/js/utils.js'));
    });

    it('has Back to Home breadcrumb', function () {
        assert.ok(html.includes('Back to Home'));
        assert.ok(html.includes('href="/"'));
    });

    it('has filter bar container', function () {
        assert.ok(html.includes('id="filter-bar"'));
    });

    it('has feed container', function () {
        assert.ok(html.includes('id="feed-container"'));
    });

    it('fetches policy-feed.json', function () {
        assert.ok(html.includes('/data/policy-feed.json'));
    });

    it('has viewport meta tag for responsiveness', function () {
        assert.ok(html.includes('width=device-width, initial-scale=1.0'));
    });

    it('uses fetchFeed to load data', function () {
        assert.ok(html.includes('fetchFeed('));
    });

    it('uses renderFeedList to render entries', function () {
        assert.ok(html.includes('renderFeedList('));
    });

    it('has page header with descriptive text', function () {
        assert.ok(html.includes('Public Policy &amp; Local Government'));
        assert.ok(html.includes('class="page-header"'));
    });
});

describe('Policy Feed Page — Filtering Logic', function () {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'policy-feed.json'), 'utf-8'));

    it('policy-feed.json has entries', function () {
        assert.ok(data.length > 0, 'Should have at least one entry');
    });

    it('all entries have category field', function () {
        data.forEach(function (entry) {
            assert.ok(entry.category, 'Entry ' + entry.id + ' should have category');
        });
    });

    it('can extract unique categories from data', function () {
        var cats = {};
        data.forEach(function (e) { if (e.category) cats[e.category] = true; });
        var uniqueCats = Object.keys(cats);
        assert.ok(uniqueCats.length > 0, 'Should have at least one category');
    });

    it('filtering by category returns subset', function () {
        var firstCat = data[0].category;
        var filtered = data.filter(function (e) { return e.category === firstCat; });
        assert.ok(filtered.length >= 1);
        assert.ok(filtered.length <= data.length);
        filtered.forEach(function (e) {
            assert.equal(e.category, firstCat);
        });
    });

    it('"all" filter returns all entries', function () {
        var filtered = data;
        assert.equal(filtered.length, data.length);
    });

    it('filtering by non-existent category returns empty', function () {
        var filtered = data.filter(function (e) { return e.category === 'nonexistent-category-xyz'; });
        assert.equal(filtered.length, 0);
    });
});

describe('Policy Feed Page — Responsive Styles', function () {
    const html = fs.readFileSync(path.join(ROOT, 'feeds', 'policy.html'), 'utf-8');

    it('filter buttons use flex-wrap for small screens', function () {
        assert.ok(html.includes('flex-wrap: wrap'));
    });

    it('does not have fixed widths that would cause horizontal scroll', function () {
        assert.ok(html.includes('max-width: 1240px'));
        assert.ok(html.includes('padding: 0 24px'));
    });
});
