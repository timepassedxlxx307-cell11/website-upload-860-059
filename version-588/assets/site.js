(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === current);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle('active', itemIndex === current);
      });
    }

    function schedule() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        activate(Number(thumb.getAttribute('data-hero-target')) || 0);
        schedule();
      });
    });

    if (slides.length > 1) {
      schedule();
    }
  }

  document.querySelectorAll('.filter-scope').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var active = '';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-keywords') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !active || text.indexOf(active.toLowerCase()) !== -1;
        card.classList.toggle('hidden', !(matchedQuery && matchedFilter));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });
})();
