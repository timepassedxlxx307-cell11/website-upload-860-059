(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        activate(idx);
      });
    });
    activate(0);
    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = selectAll('[data-filter-panel]');
    panels.forEach(function (panel) {
      var rootSelector = panel.getAttribute('data-filter-panel');
      var root = rootSelector ? document.querySelector(rootSelector) : document;
      var input = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var cards = selectAll('[data-card]', root);
      var empty = document.querySelector('[data-empty-state]');

      function apply() {
        var keyword = normalized(input && input.value);
        var regionValue = normalized(region && region.value);
        var yearValue = normalized(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalized([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.textContent
          ].join(' '));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || normalized(card.getAttribute('data-region')) === regionValue;
          var matchesYear = !yearValue || normalized(card.getAttribute('data-year')) === yearValue;
          var show = matchesKeyword && matchesRegion && matchesYear;
          card.classList.toggle('hidden-card', !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('visible', visible === 0);
        }
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayer() {
    var shell = document.querySelector('[data-player-shell]');
    var video = document.querySelector('[data-player]');
    var layer = document.querySelector('[data-play-layer]');
    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    if (!shell || !video || !button) {
      return;
    }
    var started = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attachAndPlay() {
      var url = video.getAttribute('data-url');
      if (!url) {
        setStatus('播放源暂时不可用');
        return;
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      setStatus('正在缓冲高清内容');
      if (layer) {
        layer.classList.add('hidden');
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频画面继续播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus('播放失败，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          video.play().then(function () {
            setStatus('');
          }).catch(function () {
            setStatus('点击视频画面继续播放');
          });
        }, { once: true });
      } else {
        setStatus('此浏览器暂不支持该视频格式');
      }
    }

    button.addEventListener('click', attachAndPlay);
    shell.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }
      attachAndPlay();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
}());
