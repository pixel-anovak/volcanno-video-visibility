/**
 * Visibility API
 */
(jQuery)(function ($) {

    // set name of hidden property and visibility change event
    var hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") {
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
      hidden = "mozHidden";
      visibilityChange = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    /* Add class for each youtube and vimeo iframe */
    jQuery('iframe').each(function() {

        var iframeUrl = $(this).attr('src');
        var youtubeParse = iframeUrl.match(/youtube\.com/g);
        var vimeoParse = iframeUrl.match(/vimeo\.com/g);

        if ( youtubeParse != null && youtubeParse != undefined  ) {
            $(this).addClass('youtube-iframe');
            // If is youtube add jsapi parameter
            if ( iframeUrl.match(/\?/g) ) {
                iframeUrl = iframeUrl + "&enablejsapi=1";
            } else {
                iframeUrl = iframeUrl + "?enablejsapi=1";
            }
            $(this).attr('src', iframeUrl);
        } else if ( vimeoParse != null && vimeoParse != undefined ) {
            $(this).addClass('vimeo-iframe');
        }
    });


    // Load scripts depending on video type
    var vimeoScript;
    var youtubeScript;

    if ( jQuery('iframe').hasClass('youtube-iframe') ) {
        // Load youtube scripts
        youtubeScript = document.createElement('script');
        youtubeScript.setAttribute('src', 'https://www.youtube.com/iframe_api');
        document.body.appendChild(youtubeScript);
    }
    if ( jQuery('iframe').hasClass('vimeo-iframe') ) {
        // Load vimeo scripts
        vimeoScript = document.createElement('script');
        vimeoScript.setAttribute('src', 'https://player.vimeo.com/api/player.js');
        document.body.appendChild(vimeoScript);
    }

    /**
     * Youtube
     */
    // Register all youtube iframes
    var youtube;
    var youtubePlayer;
    window.onYouTubeIframeAPIReady = function() {
        jQuery('iframe.youtube-iframe').each(function() {
            var youtubePlayerID = jQuery(this)[0];
            youtube = new YT.Player(youtubePlayerID, {
                events: {
                    'onStateChange': onPlayerStateChange
                }
            });
        });
        // Save last played video object
        function onPlayerStateChange(event) {
          var currentPlayer = event.target;
          if ( currentPlayer.getPlayerState() == 1 ) {
            youtubePlayer = currentPlayer;
          }
        }
    }

    /**
     * Vimeo
     */
    var vimeoPlayer;
    var vimeoPaused = false;
    if ( vimeoScript != undefined && vimeoScript != null ) {
        vimeoScript.onload = function() {
            var vimeoVideos = [];
            jQuery('iframe.vimeo-iframe').each(function() {
              vimeoVideos.push( new Vimeo.Player( this ) );
            });
            // Save last played video object
            vimeoVideos.forEach( function(current) {
                current.on("play", function() {
                    vimeoPlayer = current;
                    vimeoPaused = false;
                });
                current.on("pause", function() {
                    vimeoPaused = true;
                });
            });
        }
    }

    // if the page is hidden, pause the video
    // if the page is shown, play the video
    var youtubeStatus = false;
    var vimeoStatus = false;
    var html5VideoStatus = false;
    var html5Player;

    function handleVisibilityChange() {
        if (document[hidden]) {
            // Video element
            jQuery('video').each(function () {
                var videoCurrentState = this.paused;
                if ( videoCurrentState == false ) {
                    this.pause();
                    html5Player = this;
                    html5VideoStatus = true;
                }
            });
            // Youtube iframe
            if ( youtubePlayer != undefined && youtubePlayer != null ) {
                if ( youtubePlayer.getPlayerState() == 1 ) {
                    youtubePlayer.pauseVideo();
                    youtubeStatus = true;
                } else if ( youtubePlayer.getPlayerState() == 2 ) {
                    youtubeStatus = false;
                }
            }
            // Vimeo iframe
            if ( vimeoPlayer != undefined && vimeoPlayer != null ) {
                if ( vimeoPaused == false ) {
                    vimeoPlayer.pause();
                    vimeoStatus = true;
                } else if ( vimeoPaused = true ) {
                    vimeoStatus = false;
                }
            }
        } else {
            // Video element
            if ( html5Player != undefined && html5Player != null ) {
                if ( html5Player.paused == true && html5VideoStatus ) {
                    console.log( html5Player );
                    html5Player.play();
                    html5VideoStatus = false;
                }
            }
            // Youtube iframe
            if ( youtubePlayer != undefined && youtubePlayer != null ) {
                if ( youtubePlayer.getPlayerState() == 2 && youtubeStatus ) {
                    youtubePlayer.playVideo();
                }
            }
            // Vimeo iframe
            if ( vimeoPlayer != undefined && vimeoPlayer != null ) {
                if ( vimeoPaused && vimeoStatus ) {
                    vimeoPlayer.play();
                }
            }
        }
    }

    // warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || 
        typeof hidden === "undefined") {
        //alert("This demo requires a browser such as Google Chrome that supports the Page Visibility API.");
    } else {
        // handle page visibility change
        // see https://developer.mozilla.org/en/API/PageVisibility/Page_Visibility_API
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    };
});
