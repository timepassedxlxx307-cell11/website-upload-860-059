(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initSearchScopes() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".search-scope"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      var items = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
      var activeFilter = "all";

      function apply() {
        var query = normalize(input ? input.value : "");
        items.forEach(function (item) {
          var haystack = normalize(item.getAttribute("data-search"));
          var itemType = normalize(item.getAttribute("data-type"));
          var itemYear = normalize(item.getAttribute("data-year"));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var filter = normalize(activeFilter);
          var matchesFilter = filter === "all" || itemType.indexOf(filter) !== -1 || itemYear === filter || haystack.indexOf(filter) !== -1;
          item.hidden = !(matchesQuery && matchesFilter);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (node) {
            node.classList.toggle("is-active", node === chip);
          });
          apply();
        });
      });
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = "./assets/js/hls-player.js";
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error("HLS"));
        }
      };
      script.onerror = function () {
        reject(new Error("HLS"));
      };
      document.head.appendChild(script);
    });
  }

  function bindVideo(video, src) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    }).catch(function () {
      video.src = src;
    });
  }

  window.initMoviePlayer = function (src) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var overlay = document.getElementById("player-overlay");
      if (!video || !overlay || !src) {
        return;
      }
      var attached = false;

      function play() {
        overlay.classList.add("is-hidden");
        var promise = attached ? Promise.resolve() : bindVideo(video, src).then(function () {
          attached = true;
        });
        promise.then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initCarousel();
    initSearchScopes();
  });
})();
