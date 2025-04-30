import { useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";
import MuteIcon from "../../assets/icons/audio_mute.svg";
import UnmuteIcon from "../../assets/icons/audio_unmute.svg";
import ZoomInIcon from "../../assets/icons/zoom-in.svg";
import ZoomOutIcon from "../../assets/icons/zoom-out.svg";
import EmojiIcon from "../../assets/icons/happy-face.png";
import { STREAMING_TYPE, AMAZON_LATENCY_STREAMING, AGORA_STREAMING } from "../../constants/config";


interface VideoPlayerProps {
  onZoomToggle: (zoomed: boolean) => void;
  isMobileDevice: boolean;
  videoControlsVisibility: boolean;
  openEmojiModal: () => void;
  isEmojiLocked: boolean;
  allowToSendEmoji: boolean;
}

declare global {
  interface Window {
    IVSPlayer: any;
  }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  onZoomToggle,
  isMobileDevice,
  videoControlsVisibility,
  openEmojiModal,
  isEmojiLocked,
  allowToSendEmoji,
}) => {
  const url = STREAMING_TYPE === "AMAZON_LATENCY" ? AMAZON_LATENCY_STREAMING.playbackUrl : AGORA_STREAMING.defaultVideoUrl;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isVideoBlocked, setIsVideoBlocked] = useState(false);
  const playerRef = useRef<any>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (STREAMING_TYPE !== "AMAZON_LATENCY") return;
    // Dynamically load the IVS player script
    const script = document.createElement('script');
    script.src = 'https://player.live-video.net/1.39.0/amazon-ivs-player.min.js';
    script.async = true;
    script.onload = () => {
      // Check if IVS Player is supported after the script is loaded
      if (window.IVSPlayer && window.IVSPlayer.isPlayerSupported) {
        initializePlayer();
      } else {
        console.error('IVS Player is not supported on this device or browser');
      }
    };
    script.onerror = () => {
      console.error('Failed to load IVS Player script');
    };
    document.body.appendChild(script);

    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.delete();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      // Cleanup script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const initializePlayer = () => {
    const video = videoRef.current;
    if (!video || !url) return;
    // Initialize the IVS Player once the script is loaded
    const player = window.IVSPlayer.create();
    playerRef.current = player;
    playerRef.current.load(url);
    playerRef.current.attachHTMLVideoElement(videoRef.current);

    playerRef.current.setAutoplay(true);
    playerRef.current.muted = true;
    //player.setVolume(0.8);
    playerRef.current.play();

    playerRef.current.addEventListener(window.IVSPlayer.PlayerState.PLAYING, () => {
      console.log("Playing");
      // Clear retry timeout if it was set
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    });

    player.addEventListener(window.IVSPlayer.PlayerState.ENDED, () => {
      console.warn("Stream ended. Rechecking in 5 seconds...");
      retryStream();
    });

    player.addEventListener(window.IVSPlayer.PlayerState.IDLE, () => {
      console.warn("Stream idle. Might not be live yet. Retrying...");
      retryStream();
    });

    playerRef.current.addEventListener(window.IVSPlayer.PlayerEventType.ERROR, (err: any) => {
      console.error("IVS Player error:", err);
      if (err.code == 404) {
        retryStream();
      }
    });

  };

  const retryStream = () => {
    if (!playerRef.current || !url) return;
    // Clear any existing retry to avoid duplicates
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    retryTimeoutRef.current = setTimeout(() => {
      console.log("Retrying to load and play stream...");
      playerRef.current.load(url);
      playerRef.current.play();
    }, 3000); // Retry after 5 seconds
  };

  useEffect(() => {
    if (STREAMING_TYPE !== "AGORA") return;
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsMuted(false); // Video is playing with audio
        }
      } catch (error) {
        console.log("Error playing video with audio:", error);
        setIsVideoBlocked(true);
        video.muted = true;
        setIsMuted(true); // Autoplay with muted audio
        try {
          await video.play();
        } catch (mutedError) {
          console.error("Error playing muted video:", mutedError);
        }
      }
    };

    video.addEventListener("loadedmetadata", attemptPlay);
    return () => {
      video.removeEventListener("loadedmetadata", attemptPlay);
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted; // Toggle mute state
    setIsMuted(video.muted); // Update state
    setIsVideoBlocked(false);
  };

  const toggleZoom = () => {
    const newZoomState = !isZoomed;
    setIsZoomed(newZoomState);
    onZoomToggle(newZoomState); // Notify parent component
  };

  const [timer, setTimer] = useState(5);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isEmojiLocked) {
      setTimer(5); // Reset timer to 5 when locked
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current as ReturnType<typeof setTimeout>);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setTimer(5); // Reset to 5 when unlocked
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isEmojiLocked]);

  return (
    <div className="video-player-container">
      {STREAMING_TYPE === "AMAZON_LATENCY" ?
      <video ref={videoRef} playsInline className="video-player"/>
      :
      <video ref={videoRef} src={url} playsInline autoPlay loop className="video-player"/>
      }
      {videoControlsVisibility && (
        <>
          <div className="autoplay-video-placeholder" onClick={toggleMute}>
            <img
              className="autoplay-video-placeholder__icon"
              src={isMuted ? MuteIcon : UnmuteIcon}
              alt={isMuted ? "Muted" : "Unmuted"}
            />
          </div>
          {isMobileDevice && (
            <>
              <div className="autoplay-video-zoom" onClick={toggleZoom}>
                <img
                  className="autoplay-video-zoom__icon"
                  src={isZoomed ? ZoomOutIcon : ZoomInIcon}
                  alt={isZoomed ? "Zoom Out" : "Zoom In"}
                />
              </div>
              {allowToSendEmoji && (
                <div className="autoplay-video-emoji" onClick={openEmojiModal}>
                  <span className="autoplay-video-emoji__icon">
                    {!isEmojiLocked && (
                      <img
                        src={EmojiIcon}
                        alt={"Emojis"}
                      />
                    )}
                    {isEmojiLocked && (
                      <div className="emoji-handle-locked">
                        <span className="lock-icon">🔒</span>
                        {timer > 0 && <span className="lock-timer">{timer}s</span>} {/* Show timer only if > 0 */}
                      </div>
                    )}
                  </span>
                </div>
              )}
            </>
          )}
          {isVideoBlocked && (
            <div className="autoplay-video-block" onClick={toggleMute}>
              <h1 className="autoplay-video-block__text">Click to play</h1>
            </div>
          )}
        </>
      )}
    </div>
  );
};
