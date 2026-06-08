(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, pos) {
            dot.addEventListener("click", function () {
                show(pos);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilters() {
        document.querySelectorAll("[data-card-filter]").forEach(function (form) {
            var section = form.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var keyword = form.querySelector("[data-filter-keyword]");
            var year = form.querySelector("[data-filter-year]");
            var reset = form.querySelector("[data-filter-reset]");

            function apply() {
                var query = keyword ? keyword.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    card.classList.toggle("is-hidden", !(matchQuery && matchYear));
                });
            }

            if (keyword) {
                keyword.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    window.setTimeout(apply, 0);
                });
            }
            apply();
        });
    }

    function movieCardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '<a href="' + movie.url + '">',
            '<div class="poster-frame">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<div class="poster-overlay"><p>' + escapeHtml(movie.oneLine) + '</p></div>',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
            '<span class="genre-pill">' + escapeHtml(movie.genre) + '</span>',
            '</div>',
            '</a>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var year = document.querySelector("[data-search-year]");
        var results = document.querySelector("[data-search-results]");
        var fallback = document.querySelector("[data-search-fallback]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        var years = Array.prototype.slice.call(new Set(window.MOVIE_SEARCH_DATA.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort().reverse();

        years.slice(0, 40).forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            year.appendChild(option);
        });

        if (input) {
            input.value = initial;
        }

        function render() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var list = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || movie.year === selectedYear;
                return matchQuery && matchYear;
            }).slice(0, 120);

            if (!query && !selectedYear) {
                results.innerHTML = "";
                fallback.classList.remove("is-hidden");
                return;
            }
            fallback.classList.add("is-hidden");
            results.innerHTML = list.map(movieCardTemplate).join("");
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
        }
        if (input) {
            input.addEventListener("input", render);
        }
        if (year) {
            year.addEventListener("change", render);
        }
        render();
    }

    ready(function () {
        initMenu();
        initHero();
        initCardFilters();
        initSearchPage();
    });
})();

function setupMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var start = document.querySelector("[data-player-start]");
    var started = false;

    if (!video || !cover || !start) {
        return;
    }

    function play() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {});
        }
    }

    function begin() {
        if (started) {
            play();
            return;
        }
        started = true;
        cover.classList.add("player-cover-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", play, { once: true });
            video.load();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, play);
            return;
        }
        video.src = streamUrl;
        video.load();
        play();
    }

    cover.addEventListener("click", begin);
    start.addEventListener("click", function (event) {
        event.stopPropagation();
        begin();
    });
    video.addEventListener("click", function () {
        if (!started) {
            begin();
        }
    });
}
