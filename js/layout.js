/* ══════════════════════════════════════════
   Hill Country Sentinel — Layout Components
   Shared nav and footer injected into all pages
   ══════════════════════════════════════════ */

(function () {
    'use strict';

    // Detect base path for GitHub Pages deployment
    function getBase() {
        if (typeof window === 'undefined') return '';
        var path = window.location.pathname;
        var isGitHubPages = window.location.hostname.includes('github.io');
        var baseProject = isGitHubPages ? '/hill-country-sentinel/' : '/';
        
        // If in articles/archive/ (two levels deep), go up two levels
        if (path.match(/\/articles\/archive\//i)) return '../../';
        // If in a subdirectory like /hill-country-sentinel/feeds/, go up one level
        if (path.match(/\/feeds\//i) || path.match(/\/profiles\//i) || path.match(/\/articles\//i)) {
            return isGitHubPages ? '../' : '../';
        }
        // If we're at the root level on GitHub Pages, include the project base
        return isGitHubPages && !path.includes('/hill-country-sentinel/') ? baseProject : '';
    }

    var NAV_LINKS = [
        { label: 'Home', href: 'index.html' },
        { label: 'News', href: 'feeds/news.html' },
        { label: 'Candidates', href: 'feeds/candidates.html' },
        { label: 'Policy', href: 'feeds/policy.html' },
        { label: 'Business Watch', href: 'feeds/business.html' }
    ];

    function renderNav() {
        var base = getBase();
        var linksHtml = NAV_LINKS.map(function (link) {
            return '<li><a href="' + base + link.href + '">' + link.label + '</a></li>';
        }).join('\n            ');

        return '<div class="top-bar">Hill Country Sentinel &mdash; Informed Citizens. Accountable Leaders.</div>\n' +
            '<nav>\n' +
            '  <div class="nav-inner">\n' +
            '    <a href="' + base + 'index.html" class="logo">Hill Country <span>Sentinel</span></a>\n' +
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
            '  <div class="footer-brand">Hill Country Sentinel</div>\n' +
            '  <p>&copy; ' + year + ' Hill Country Sentinel. Independent political intelligence.</p>\n' +
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

    // Candidate name to profile mapping (only includes existing profiles)
    var CANDIDATE_PROFILES = {
        'Angela Allen': 'angela-allen.html',
        'April Ryan': 'april-ryan.html',
        'Bradley Porter': 'bradley-porter.html',
        'Carrie Isaac': 'carrie-isaac.html',
        'Donna Campbell': 'donna-campbell.html',
        'Doug Leecock': 'doug-leecock.html',
        'D. Lee Edwards': 'd-lee-edwards.html',
        'Jen Crownover': 'jen-crownover.html',
        'Jonathon Frazier': 'jonathon-frazier.html',
        'Kevin Webb': 'kevin-webb.html',
        'Lawrence Spradley': 'lawrence-spradley.html',
        'Mary Ann Labowski': 'mary-ann-labowski.html',
        'Michael Capizzi': 'michael-capizzi.html',
        'Michael French': 'michael-french.html',
        'Neal Linnartz': 'neal-linnartz.html',
        'Scott Haag': 'scott-haag.html',
        'Toni Carter': 'toni-carter.html'
    };

    function autoLinkCandidateNames() {
        var base = getBase();
        var profileBase = base + 'profiles/';
        
        // Function to escape regex special characters
        function escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Sort names by length (longest first) to match full names before partial matches
        var sortedNames = Object.keys(CANDIDATE_PROFILES).sort(function(a, b) {
            return b.length - a.length;
        });
        
        // Find all text nodes in the document (excluding nav and footer)
        var walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip nav, footer, and already linked text
                    var parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    if (parent.tagName === 'A' || 
                        parent.closest('nav') || 
                        parent.closest('footer') ||
                        parent.closest('#site-nav') ||
                        parent.closest('#site-footer')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        var textNodes = [];
        var node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Process each text node
        textNodes.forEach(function(textNode) {
            var originalText = textNode.textContent;
            var modifiedText = originalText;
            var hasChanges = false;
            
            sortedNames.forEach(function(candidateName) {
                var profileFile = CANDIDATE_PROFILES[candidateName];
                var regex = new RegExp('\\b' + escapeRegex(candidateName) + '\\b', 'gi');
                var matches = modifiedText.match(regex);
                
                if (matches) {
                    // Only link if not already part of a link
                    modifiedText = modifiedText.replace(regex, function(match) {
                        hasChanges = true;
                        return '<a href="' + profileBase + profileFile + '" class="auto-candidate-link">' + match + '</a>';
                    });
                }
            });
            
            // Replace the text node with new HTML if changes were made
            if (hasChanges) {
                var wrapper = document.createElement('span');
                wrapper.innerHTML = modifiedText;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    }

    function initLayout() {
        var navEl = document.getElementById('site-nav');
        var footerEl = document.getElementById('site-footer');
        if (navEl) { navEl.innerHTML = renderNav(); }
        if (footerEl) { footerEl.innerHTML = renderFooter(); }
        initMobileMenu();
        
        // Auto-link candidate names after a short delay
        setTimeout(autoLinkCandidateNames, 100);
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
