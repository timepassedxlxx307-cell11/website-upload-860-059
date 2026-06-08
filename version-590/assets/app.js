function setupMobileMenu() {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-nav]');
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', function () {
    menu.classList.toggle('is-open');
  });
}

function setupHeroSliders() {
  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    if (!slides.length) {
      return;
    }
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
    show(0);
  });
}

function setupFilters() {
  document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
    var scope = panel.parentElement || document;
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-year-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = panel.querySelector('[data-filter-empty]');
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value.trim() : '';
      var typeValue = type ? type.value.trim() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = !yearValue || (card.getAttribute('data-year') || '').indexOf(yearValue) !== -1;
        var matchesType = !typeValue || (card.getAttribute('data-type') || '').indexOf(typeValue) !== -1;
        var matched = matchesQuery && matchesYear && matchesType;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  });
}

function setupBackTop() {
  var button = document.querySelector('[data-back-top]');
  if (!button) {
    return;
  }
  function update() {
    button.classList.toggle('is-visible', window.scrollY > 420);
  }
  button.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', update);
  update();
}

function initMoviePlayer(videoId, source) {
  var video = document.getElementById(videoId);
  if (!video || !source) {
    return;
  }
  var frame = video.closest('.player-frame');
  var cover = frame ? frame.querySelector('.player-cover') : null;
  var hlsInstance = null;
  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
      return;
    }
    if (video.src !== source) {
      video.src = source;
    }
  }
  function play() {
    bindSource();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }
  if (cover) {
    cover.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener('DOMContentLoaded', function () {
  setupMobileMenu();
  setupHeroSliders();
  setupFilters();
  setupBackTop();
});
