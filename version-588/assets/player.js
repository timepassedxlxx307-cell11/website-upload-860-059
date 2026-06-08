(function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-box[data-stream]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-start');
    var stream = box.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attach() {
      if (!video || !stream || attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      attached = true;
    }

    function play() {
      attach();
      box.classList.add('is-playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (!video.seeking && video.currentTime === 0) {
          box.classList.remove('is-playing');
        }
      });
    }

    box.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        play();
      }
    });
  });
})();
