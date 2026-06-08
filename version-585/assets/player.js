(function () {
    var frame = document.querySelector('.player-frame[data-video]');
    var video = document.getElementById('movie-player');
    var button = document.querySelector('.player-start');

    if (!frame || !video || !button) {
        return;
    }

    var source = frame.getAttribute('data-video');
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function startPlayback() {
        attachSource();
        frame.classList.add('is-playing');
        var playback = video.play();

        if (playback && typeof playback.catch === 'function') {
            playback.catch(function () {});
        }
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
    });

    frame.addEventListener('click', function (event) {
        if (event.target === video) {
            return;
        }
        startPlayback();
    });

    video.addEventListener('play', function () {
        frame.classList.add('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
