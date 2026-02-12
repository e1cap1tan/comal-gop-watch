/**
 * Comal County GOP Watch — Feed Renderer Module
 *
 * Fetches JSON feed data and renders feed cards.
 * Works in browser (globals) and Node.js (CommonJS).
 */

/* global formatDate */

/**
 * Fetch a JSON feed from a URL.
 * @param {string} url - URL to the JSON feed file
 * @returns {Promise<Array>} Array of feed entries sorted newest-first
 */
async function fetchFeed(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    const entries = await response.json();
    return sortEntriesByDate(entries);
}

/**
 * Sort entries by date descending (newest first).
 * @param {Array} entries - Feed entries
 * @returns {Array} Sorted entries
 */
function sortEntriesByDate(entries) {
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Format a category slug into a display label.
 * @param {string} category - Category slug (e.g. "county-government")
 * @returns {string} Display label (e.g. "County Government")
 */
function formatCategory(category) {
    if (!category) return '';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Render a single feed card as an HTML string.
 * @param {object} entry - Feed entry object
 * @returns {string} HTML string for the feed card
 */
function renderFeedCard(entry) {
    const _formatDate = typeof formatDate === 'function' ? formatDate : function(d) {
        const date = new Date(d);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const dateStr = _formatDate(entry.date);
    const categoryBadge = entry.category
        ? `<span class="tag category-badge">${escapeHtml(formatCategory(entry.category))}</span>`
        : '';

    const tags = (entry.tags && entry.tags.length > 0)
        ? entry.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')
        : '';

    const sourceName = escapeHtml(entry.source || 'Source');
    const sourceUrl = entry.sourceUrl ? escapeHtml(entry.sourceUrl) : '';

    const thumbnailImage = entry.image 
        ? `<div class="entry-thumbnail">
            <img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.title || '')}" />
           </div>`
        : '';

    const cardInner = `${thumbnailImage}<div class="entry-content">
        <div class="entry-date">${escapeHtml(dateStr)}</div>
        <h3 class="entry-title">${escapeHtml(entry.title || '')}</h3>
        <p class="entry-summary">${escapeHtml(entry.summary || '')}</p>
        <div class="entry-meta">
            ${categoryBadge}${tags}
        </div>
        <div class="entry-source">Source: ${sourceName}</div>
    </div>`;

    if (sourceUrl) {
        return `<a href="${sourceUrl}" target="_blank" rel="noopener" class="feed-entry-link"><article class="feed-entry" data-id="${escapeHtml(entry.id || '')}">
    ${cardInner}
</article></a>`;
    }

    return `<article class="feed-entry" data-id="${escapeHtml(entry.id || '')}">
    ${cardInner}
</article>`;
}

/**
 * Render a list of feed entries into a container element.
 * Entries are sorted newest-first.
 * @param {Array} entries - Feed entries
 * @param {HTMLElement|null} containerEl - DOM element to render into (if null, returns HTML string)
 * @returns {string} The rendered HTML
 */
function renderFeedList(entries, containerEl) {
    const sorted = sortEntriesByDate(entries);
    const html = sorted.map(entry => renderFeedCard(entry)).join('\n');
    if (containerEl && typeof containerEl === 'object' && 'innerHTML' in containerEl) {
        containerEl.innerHTML = html;
    }
    return html;
}

/**
 * Render a preview of feed entries (limited count) with a "View All" link.
 * @param {Array} entries - Feed entries
 * @param {HTMLElement|null} containerEl - DOM element to render into (if null, returns HTML string)
 * @param {number} [limit=3] - Maximum entries to show
 * @param {string} [viewAllUrl='#'] - URL for the "View All" link
 * @returns {string} The rendered HTML
 */
function renderFeedPreview(entries, containerEl, limit, viewAllUrl) {
    limit = limit || 3;
    viewAllUrl = viewAllUrl || '#';
    const sorted = sortEntriesByDate(entries);
    const limited = sorted.slice(0, limit);
    const cardsHtml = limited.map(entry => renderFeedCard(entry)).join('\n');
    const viewAllHtml = `<a href="${escapeHtml(viewAllUrl)}" class="view-all">View All →</a>`;
    const html = cardsHtml + '\n' + viewAllHtml;
    if (containerEl && typeof containerEl === 'object' && 'innerHTML' in containerEl) {
        containerEl.innerHTML = html;
    }
    return html;
}

// Export for Node.js (tests), no-op in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchFeed,
        sortEntriesByDate,
        escapeHtml,
        formatCategory,
        renderFeedCard,
        renderFeedList,
        renderFeedPreview
    };
}
