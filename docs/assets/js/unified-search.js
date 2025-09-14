/**
 * Unified Search Component
 * A reusable search component for filtering cards across the site
 * Works with both documentation cards and framework cards
 */

class UnifiedSearch {
    constructor(config = {}) {
        // Configuration with defaults
        this.config = {
            searchInputId: config.searchInputId || 'searchInput',
            cardSelector: config.cardSelector || '.doc-card, .framework-card',
            containerSelector: config.containerSelector || '.category-section, .frameworks-grid',
            titleSelector: config.titleSelector || '.doc-title, .framework-title',
            descriptionSelector: config.descriptionSelector || '.doc-description, .framework-description',
            noResultsMessage: config.noResultsMessage || 'No results found',
            searchPlaceholder: config.searchPlaceholder || 'Start typing to filter...',
            enableKeyboardShortcut: config.enableKeyboardShortcut !== false,
            onSearch: config.onSearch || null, // Callback function
            minSearchLength: config.minSearchLength || 1,
            debounceDelay: config.debounceDelay || 0 // No delay by default for instant search
        };

        this.searchInput = null;
        this.cards = [];
        this.containers = [];
        this.debounceTimer = null;
        this.noResultsElement = null;

        this.init();
    }

    init() {
        // Get search input
        this.searchInput = document.getElementById(this.config.searchInputId);
        if (!this.searchInput) {
            console.warn(`[UnifiedSearch] Search input with ID "${this.config.searchInputId}" not found`);
            return;
        }

        // Set placeholder
        this.searchInput.placeholder = this.config.searchPlaceholder;

        // Get cards and containers
        this.cards = document.querySelectorAll(this.config.cardSelector);
        this.containers = document.querySelectorAll(this.config.containerSelector);

        console.log(`[UnifiedSearch] Initialized with ${this.cards.length} cards`);

        // Bind events
        this.bindEvents();
    }

    bindEvents() {
        // Search input events
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('keyup', (e) => this.handleSearch(e));

        // Keyboard shortcut (/)
        if (this.config.enableKeyboardShortcut) {
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== this.searchInput) {
                    e.preventDefault();
                    this.searchInput.focus();
                    this.searchInput.select();
                }
            });
        }

        // Clear search on Escape
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }

    handleSearch(event) {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce if configured
        if (this.config.debounceDelay > 0) {
            this.debounceTimer = setTimeout(() => {
                this.performSearch();
            }, this.config.debounceDelay);
        } else {
            this.performSearch();
        }
    }

    performSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();

        // Check minimum search length
        if (searchTerm.length > 0 && searchTerm.length < this.config.minSearchLength) {
            return;
        }

        let visibleCount = 0;
        const matchedCards = [];

        // Filter cards
        this.cards.forEach(card => {
            const title = this.getCardText(card, this.config.titleSelector);
            const description = this.getCardText(card, this.config.descriptionSelector);

            // Additional searchable content (icons, tags, etc.)
            const additionalContent = this.getAdditionalSearchContent(card);

            const searchableText = `${title} ${description} ${additionalContent}`.toLowerCase();
            const matches = searchTerm === '' || searchableText.includes(searchTerm);

            // Show/hide card
            card.style.display = matches ? '' : 'none';

            if (matches) {
                visibleCount++;
                matchedCards.push({
                    element: card,
                    title: title,
                    relevance: this.calculateRelevance(searchableText, searchTerm)
                });
            }
        });

        // Sort by relevance if searching
        if (searchTerm !== '') {
            matchedCards.sort((a, b) => b.relevance - a.relevance);
            // Reorder DOM elements based on relevance
            const parent = this.cards[0]?.parentElement;
            if (parent) {
                matchedCards.forEach(item => {
                    parent.appendChild(item.element);
                });
            }
        }

        // Update container visibility
        this.updateContainerVisibility();

        // Handle no results
        this.handleNoResults(visibleCount, searchTerm);

        // Call custom callback if provided
        if (this.config.onSearch) {
            this.config.onSearch({
                searchTerm,
                visibleCount,
                totalCount: this.cards.length,
                matchedCards
            });
        }

        // Log search analytics
        console.log(`[UnifiedSearch] Search for "${searchTerm}": ${visibleCount}/${this.cards.length} results`);
    }

    getCardText(card, selector) {
        const element = card.querySelector(selector);
        return element ? element.textContent.toLowerCase() : '';
    }

    getAdditionalSearchContent(card) {
        // Get all text content from the card for comprehensive search
        const tags = card.querySelectorAll('.tag, .badge, .category, .doc-tags');
        const icons = card.querySelectorAll('.doc-icon, .framework-icon');

        let content = '';
        tags.forEach(tag => content += ' ' + tag.textContent);
        icons.forEach(icon => content += ' ' + icon.textContent);

        // Also check data attributes
        if (card.dataset.category) content += ' ' + card.dataset.category;
        if (card.dataset.tags) content += ' ' + card.dataset.tags;
        if (card.dataset.name) content += ' ' + card.dataset.name;

        return content.toLowerCase();
    }

    calculateRelevance(text, searchTerm) {
        if (searchTerm === '') return 0;

        let relevance = 0;

        // Exact match
        if (text === searchTerm) relevance += 100;

        // Starts with search term
        if (text.startsWith(searchTerm)) relevance += 50;

        // Contains search term
        if (text.includes(searchTerm)) relevance += 25;

        // Word boundary match
        const wordBoundaryRegex = new RegExp(`\\b${searchTerm}`, 'i');
        if (wordBoundaryRegex.test(text)) relevance += 30;

        // Calculate match frequency
        const matches = (text.match(new RegExp(searchTerm, 'gi')) || []).length;
        relevance += matches * 10;

        return relevance;
    }

    updateContainerVisibility() {
        this.containers.forEach(container => {
            const visibleCards = container.querySelectorAll(
                `${this.config.cardSelector}:not([style*="none"])`
            );
            container.style.display = visibleCards.length > 0 ? '' : 'none';
        });
    }

    handleNoResults(visibleCount, searchTerm) {
        const existingMessage = document.getElementById('unified-no-results');

        if (visibleCount === 0 && searchTerm !== '') {
            if (!existingMessage) {
                this.noResultsElement = document.createElement('div');
                this.noResultsElement.id = 'unified-no-results';
                this.noResultsElement.className = 'no-results-message';
                this.noResultsElement.style.cssText = `
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #64748b;
                    grid-column: 1 / -1;
                `;

                this.noResultsElement.innerHTML = `
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                    <h2 style="color: #1e293b; margin-bottom: 1rem;">${this.config.noResultsMessage}</h2>
                    <p>No results for "<strong>${this.escapeHtml(searchTerm)}</strong>"</p>
                    <button onclick="unifiedSearch.clearSearch()"
                            style="margin-top: 1rem; padding: 0.5rem 1rem;
                                   background: #6366f1; color: white;
                                   border: none; border-radius: 6px;
                                   cursor: pointer;">
                        Clear Search
                    </button>
                `;

                // Insert after search or at the beginning of main content
                const mainContent = document.querySelector('main') ||
                                  document.querySelector('.container') ||
                                  document.body;

                if (this.searchInput.parentElement) {
                    this.searchInput.parentElement.parentElement.appendChild(this.noResultsElement);
                } else {
                    mainContent.appendChild(this.noResultsElement);
                }
            } else {
                existingMessage.querySelector('strong').textContent = searchTerm;
            }
        } else if (existingMessage) {
            existingMessage.remove();
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        this.performSearch();
        this.searchInput.focus();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods

    setSearchTerm(term) {
        this.searchInput.value = term;
        this.performSearch();
    }

    getVisibleCount() {
        return document.querySelectorAll(
            `${this.config.cardSelector}:not([style*="none"])`
        ).length;
    }

    getSearchTerm() {
        return this.searchInput.value;
    }

    reset() {
        this.clearSearch();
        // Reset any sorting
        const originalOrder = Array.from(this.cards).sort((a, b) => {
            const aIndex = parseInt(a.dataset.originalIndex || 0);
            const bIndex = parseInt(b.dataset.originalIndex || 0);
            return aIndex - bIndex;
        });

        const parent = this.cards[0]?.parentElement;
        if (parent) {
            originalOrder.forEach(card => parent.appendChild(card));
        }
    }

    destroy() {
        // Clean up event listeners
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearch);
            this.searchInput.removeEventListener('keyup', this.handleSearch);
        }

        // Remove no results message
        if (this.noResultsElement) {
            this.noResultsElement.remove();
        }

        // Clear timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}

// Store original card positions for reset functionality
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.doc-card, .framework-card').forEach((card, index) => {
        card.dataset.originalIndex = index;
    });
});

// Export for use in other scripts
window.UnifiedSearch = UnifiedSearch;