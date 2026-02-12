/**
 * Comal County GOP Watch — Profile Feed Module
 *
 * Fetches candidate-news.json and renders entries filtered by relatedCandidate slug.
 * Works in browser (globals) and Node.js (CommonJS).
 */

/* global renderFeedCard, fetchFeed */

/**
 * Get the candidate slug from the page's data-candidate-slug attribute on <body>,
 * or derive it from the HTML filename.
 * @param {object} [doc] - Document-like object (for testing)
 * @returns {string|null} slug or null
 */
function getCandidateSlug(doc) {
    var d = doc || (typeof document !== 'undefined' ? document : null);
    if (!d) return null;

    // Check data attribute first
    if (d.body && d.body.getAttribute) {
        var attr = d.body.getAttribute('data-candidate-slug');
        if (attr) return attr;
    }

    // Derive from URL/filename
    var path = '';
    if (d.location && d.location.pathname) {
        path = d.location.pathname;
    } else if (typeof window !== 'undefined' && window.location) {
        path = window.location.pathname;
    }
    if (path) {
        var match = path.match(/\/profiles\/([^/]+)\.html/);
        if (match) return match[1];
    }
    return null;
}

/**
 * Filter feed entries by relatedCandidate slug.
 * @param {Array} entries - Feed entries
 * @param {string} slug - Candidate slug to match
 * @returns {Array} Filtered entries sorted newest-first
 */
function filterByCandidate(entries, slug) {
    if (!entries || !slug) return [];
    return entries
        .filter(function(e) { return e.relatedCandidate === slug; })
        .sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
}

/**
 * Render the candidate's recent activity feed into a container.
 * @param {Array} entries - Already-filtered entries
 * @param {HTMLElement|object} container - DOM element or mock
 * @returns {string} HTML string
 */
function renderProfileFeed(entries, container) {
    if (!entries || entries.length === 0) {
        var html = '<p class="no-activity">No recent activity found for this official.</p>';
        if (container && typeof container === 'object') container.innerHTML = html;
        return html;
    }

    var html = '';
    for (var i = 0; i < entries.length; i++) {
        if (typeof renderFeedCard === 'function') {
            html += renderFeedCard(entries[i]);
        } else {
            // Fallback rendering
            var e = entries[i];
            var dateStr = e.date ? new Date(e.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            html += '<div class="feed-card">';
            html += '<div class="feed-card-date">' + dateStr + '</div>';
            html += '<h3 class="feed-card-title">' + (e.title || '') + '</h3>';
            html += '<p class="feed-card-summary">' + (e.summary || '') + '</p>';
            if (e.source && e.sourceUrl) {
                html += '<a class="feed-card-source" href="' + e.sourceUrl + '" target="_blank" rel="noopener">Source: ' + e.source + '</a>';
            }
            html += '</div>';
        }
    }

    if (container && typeof container === 'object') container.innerHTML = html;
    return html;
}

/**
 * Initialize the profile feed: fetch data, filter, render.
 * Call this on DOMContentLoaded for profile pages.
 * @param {object} [options] - { slug, containerId, feedUrl }
 */
async function initProfileFeed(options) {
    var opts = options || {};
    var slug = opts.slug || getCandidateSlug();
    var containerId = opts.containerId || 'candidate-activity';
    // Detect relative base path based on current page location
    var basePath = '';
    if (typeof window !== 'undefined') {
        var loc = window.location.pathname;
        if (loc.match(/\/feeds\//i) || loc.match(/\/profiles\//i)) basePath = '../';
    }
    var feedUrl = opts.feedUrl || (basePath + 'data/candidate-news.json');

    var container = document.getElementById(containerId);
    if (!container || !slug) return;

    try {
        var fetcher = typeof fetchFeed === 'function' ? fetchFeed : async function(url) {
            var resp = await fetch(url);
            return resp.json();
        };
        var entries = await fetcher(feedUrl);
        var filtered = filterByCandidate(entries, slug);
        renderProfileFeed(filtered, container);
    } catch (err) {
        container.innerHTML = '<p class="no-activity">Unable to load recent activity.</p>';
    }
}

// Browser auto-init
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initProfileFeed();
    });
}

// Node.js exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCandidateSlug, filterByCandidate, renderProfileFeed, initProfileFeed };
}
