
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var activate = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    setInterval(function () {
      activate(index + 1);
    }, 5200);
  }

  var setQueryFromUrl = function () {
    var input = document.querySelector('.js-query-input');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q') || '';
    input.value = value;
  };

  var filterCards = function (input) {
    var list = document.querySelector('.js-filter-list');
    if (!list || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var run = function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
      });
    };
    input.addEventListener('input', run);
    run();
  };

  setQueryFromUrl();
  Array.prototype.slice.call(document.querySelectorAll('.js-card-filter')).forEach(filterCards);

  var quickFilters = document.querySelector('[data-quick-filters]');
  if (quickFilters) {
    var input = document.querySelector('.js-card-filter');
    Array.prototype.slice.call(quickFilters.querySelectorAll('button')).forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.getAttribute('data-filter') || '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-start');
    var stream = player.getAttribute('data-stream');
    var hlsInstance = null;
    var prepare = function () {
      if (!video || !stream || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      video.setAttribute('data-ready', '1');
      player.classList.add('is-ready');
    };
    var play = function () {
      prepare();
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    };
    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-ready');
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
