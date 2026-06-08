(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
        var prev = slider.querySelector('[data-slide-prev]');
        var next = slider.querySelector('[data-slide-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function() {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function() {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                showSlide(Number(dot.getAttribute('data-slide-dot')) || 0);
                restart();
            });
        });

        restart();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var grid = document.querySelector('[data-card-grid]');
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];
        var searchInput = filterPanel.querySelector('[data-card-search]');
        var yearSelect = filterPanel.querySelector('[data-year-filter]');
        var typeSelect = filterPanel.querySelector('[data-type-filter]');
        var genreButtons = Array.prototype.slice.call(filterPanel.querySelectorAll('[data-genre-filter]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var activeGenre = '';

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function updateCards() {
            var query = normalize(searchInput && searchInput.value);
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;
                var matchType = !type || card.getAttribute('data-type') === type;
                var matchGenre = !activeGenre || normalize(card.getAttribute('data-genre')).indexOf(normalize(activeGenre)) !== -1;
                var show = matchQuery && matchYear && matchType && matchGenre;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', updateCards);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', updateCards);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', updateCards);
        }

        genreButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                activeGenre = button.getAttribute('data-genre-filter') || '';
                genreButtons.forEach(function(item) {
                    item.classList.toggle('active', item === button);
                });
                updateCards();
            });
        });
    }

    var searchForm = document.querySelector('[data-search-form]');
    var searchResults = document.querySelector('[data-search-results]');
    var searchTitle = document.querySelector('[data-search-title]');
    var searchEmpty = document.querySelector('[data-search-empty]');

    if (searchForm && searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var input = searchForm.querySelector('input[name="q"]');

        if (input) {
            input.value = q;
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        function render(list) {
            searchResults.innerHTML = list.map(function(movie) {
                var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');

                return '<article class="movie-card movie-card-compact">' +
                    '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="play-chip">播放</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
                    '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');

            if (searchEmpty) {
                searchEmpty.classList.toggle('show', list.length === 0);
            }
        }

        if (q.trim()) {
            var needle = q.trim().toLowerCase();
            var matches = window.SEARCH_MOVIES.filter(function(movie) {
                return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.oneLine]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(needle) !== -1;
            }).slice(0, 120);

            if (searchTitle) {
                searchTitle.textContent = q + ' 的搜索结果';
            }

            render(matches);
        }
    }
})();
