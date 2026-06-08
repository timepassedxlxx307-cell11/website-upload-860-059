(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector('[data-hero-carousel]');
    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 6200);
    }
  }

  function setupFilters() {
    selectAll('[data-filter-page]').forEach(function (panel) {
      var root = panel.parentElement || document;
      var search = panel.querySelector('[data-filter-search]');
      var region = panel.querySelector('[data-filter-region]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = panel.querySelector('[data-filter-empty]');
      var cards = selectAll('[data-card]', root);

      function apply() {
        var query = normalize(search && search.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var show = matchQuery && matchRegion && matchYear;
          card.classList.toggle('is-hidden', !show);
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderMovieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="card-badge">' + escapeHtml(movie.region) + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var eyebrow = document.querySelector('[data-search-eyebrow]');
    if (!results || !input || !window.SITE_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var normalized = normalize(query);
      var list = normalized ? window.SITE_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.tags,
          movie.description
        ].join(' ')).indexOf(normalized) !== -1;
      }) : window.SITE_MOVIES.slice(0, 24);

      if (title) {
        title.textContent = normalized ? '搜索结果' : '热门影视';
      }
      if (eyebrow) {
        eyebrow.textContent = normalized ? '匹配影片' : '精选推荐';
      }
      results.innerHTML = list.slice(0, 120).map(renderMovieCard).join('') || '<p class="empty-state">没有找到匹配影片。</p>';
    }

    render(initial);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play]');
      var overlay = shell.querySelector('[data-overlay]');
      var streamUrl = shell.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      function load() {
        if (loaded || !video || !streamUrl) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        load();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (overlay && overlay !== button) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-back-to-top]');
    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 420);
    });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupFilters();
    setupSearchPage();
    setupPlayers();
    setupBackToTop();
  });
})();
