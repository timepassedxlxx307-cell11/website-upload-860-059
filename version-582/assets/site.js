(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupNavigation() {
        var button = document.querySelector(".mobile-nav-toggle");
        var nav = document.querySelector("#main-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle("is-active", pos === index);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle("is-active", pos === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        restart();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");
        if (!panel || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
        var search = panel.querySelector("[data-filter-search]");
        var category = panel.querySelector("[data-filter-category]");
        var regionButtons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-region]"));
        var empty = document.querySelector("[data-empty-result]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var activeRegion = "all";

        if (search) {
            search.value = query;
        }

        function apply() {
            var text = normalize(search ? search.value : "");
            var categoryValue = category ? category.value : "all";
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-text"));
                var cardRegion = card.getAttribute("data-region") || "other";
                var cardCategory = card.getAttribute("data-category") || "";
                var textMatch = !text || haystack.indexOf(text) !== -1;
                var regionMatch = activeRegion === "all" || cardRegion === activeRegion;
                var categoryMatch = categoryValue === "all" || cardCategory === categoryValue;
                var visible = textMatch && regionMatch && categoryMatch;
                card.hidden = !visible;
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        if (search) {
            search.addEventListener("input", apply);
        }
        if (category) {
            category.addEventListener("change", apply);
        }
        regionButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeRegion = button.getAttribute("data-filter-region") || "all";
                regionButtons.forEach(function (other) {
                    other.classList.toggle("is-active", other === button);
                });
                apply();
            });
        });
        apply();
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });

    window.initMoviePlayer = function (videoId, coverId, mediaUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var hls = null;
        var loaded = false;

        if (!video || !cover || !mediaUrl) {
            return;
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = mediaUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(mediaUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = mediaUrl;
        }

        function start() {
            attach();
            cover.classList.add("is-hidden");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            cover.classList.add("is-hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
