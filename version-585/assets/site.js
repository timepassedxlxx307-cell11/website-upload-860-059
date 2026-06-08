(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterGrid = document.querySelector('[data-filter-grid]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && filterGrid) {
        var items = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card, .rank-row'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query) {
            filterInput.value = query;
        }

        function applyFilter() {
            var value = filterInput.value.trim().toLowerCase();
            var visible = 0;

            items.forEach(function (item) {
                var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                item.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
}());
