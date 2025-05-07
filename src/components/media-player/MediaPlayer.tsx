import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
} from "@livePlay/web-sdk";
import "./MediaPlayer.css";
import MuteIcon from "../../assets/icons/audio_mute.svg";
import UnmuteIcon from "../../assets/icons/audio_unmute.svg";
import ZoomInIcon from "../../assets/icons/zoom-in.svg";
import ZoomOutIcon from "../../assets/icons/zoom-out.svg";
import EmojiIcon from "../../assets/icons/happy-face.png";
import { STREAMING_TYPE } from "../../constants/config";

interface MediaPlayerProps {
  user: IAgoraRTCRemoteUser | null;
  hasVideo: boolean;
  videoTrack?: any;
  subscribeVideo: (user: IAgoraRTCRemoteUser) => Promise<IRemoteVideoTrack>;
  unsubscribeVideo: (user: IAgoraRTCRemoteUser) => Promise<IRemoteVideoTrack>;
  isHostAudioMuted: boolean;
  toggleHostAudioMute: () => void;
  onZoomToggle: (zoomed: boolean) => void;
  isMobileDevice: boolean;
  videoControlsVisibility: boolean;
  openEmojiModal: () => void;
  isEmojiLocked: boolean;
  allowToSendEmoji: boolean;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  user,
  hasVideo,
  videoTrack,
  subscribeVideo,
  unsubscribeVideo,
  isHostAudioMuted,
  toggleHostAudioMute,
  onZoomToggle,
  isMobileDevice,
  videoControlsVisibility,
  openEmojiModal,
  isEmojiLocked,
  allowToSendEmoji,
}) => {
  const container = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const setupVideoTrack = useCallback(async () => {
    if (!container.current) {
      return;
    }
    if (STREAMING_TYPE == 'AMAZON_REALTIME') {
      if (hasVideo && videoTrack) {
        // Assuming videoTrack is a MediaStreamTrack
        const mediaStream = new MediaStream([videoTrack]);
        const videoElement = document.createElement("video");
        videoElement.srcObject = mediaStream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
       // videoElement.muted = true;

        // videoElement.play().catch((error) => {
        //   console.error("Error playing video:", error);
        // });

        container.current.appendChild(videoElement);
      }

    } else {
      if (hasVideo && videoTrack) {
        videoTrack.play(container.current);
      } else if (hasVideo && !videoTrack && user) {
        const newVideoTrack = await subscribeVideo(user);
        newVideoTrack.play(container.current);
      }
    }

  }, [hasVideo, videoTrack, subscribeVideo, user]);

  useEffect(() => {
    return () => {
      if (user && user.videoTrack) {
        unsubscribeVideo(user);
      }
    };
  }, [user, unsubscribeVideo]);

  useLayoutEffect(() => {
    setupVideoTrack();
  }, []);

  useLayoutEffect(() => {
    setupVideoTrack();
  }, [videoTrack]);

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
    <div className="media-player">
      <div ref={container} className="media-player-container">
        {videoControlsVisibility && (
          <div>
            <div className="autoplay-media-placeholder" onClick={toggleHostAudioMute}>
              <img
                className="autoplay-media-placeholder__icon"
                src={isHostAudioMuted ? MuteIcon : UnmuteIcon}
                alt={isHostAudioMuted ? "Muted" : "Unmuted"}
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
          </div>
        )}

        {!hasVideo && (
          <div className="no-media-placeholder">
            <span>No Video</span>
          </div>
        )}
      </div>
    </div>
  );
};
