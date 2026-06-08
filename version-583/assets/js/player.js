function initMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var shell = video ? video.closest('.player-shell') : null;
    var started = false;
    var hls = null;

    if (!video || !button || !shell || !streamUrl) {
        return;
    }

    function attachStream() {
        if (started) {
            return Promise.resolve();
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return new Promise(function(resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function() {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function play() {
        shell.classList.add('is-playing');
        attachStream().then(function() {
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function() {
                    shell.classList.remove('is-playing');
                });
            }
        }).catch(function() {
            shell.classList.remove('is-playing');
        });
    }

    button.addEventListener('click', play);

    video.addEventListener('click', function() {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function() {
        shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function() {
        if (!video.currentTime) {
            shell.classList.remove('is-playing');
        }
    });
}
