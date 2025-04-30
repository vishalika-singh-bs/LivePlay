import React from "react";
import { IAgoraRTCRemoteUser, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import "./VideoSection.css";
import { MediaPlayer } from "../media-player/MediaPlayer";
import { VideoPlayer } from "../video-player/VideoPlayer";

interface VideoSectionProps {
  agoraHost: IAgoraRTCRemoteUser | null;
  joinState: string;
  hasVideo: boolean;
  subscribeVideo: (user: IAgoraRTCRemoteUser) => Promise<IRemoteVideoTrack>;
  unsubscribeVideo: (user: IAgoraRTCRemoteUser) => Promise<any>;
  isHostAudioMuted: boolean;
  toggleHostAudioMute: () => void;
  onZoomToggle: (zoomed: boolean) => void;
  isMobileDevice: boolean;
  videoControlsVisibility: boolean;
  openEmojiModal: () => void;
  isEmojiLocked: boolean;
  allowToSendEmoji: boolean;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  agoraHost,
  joinState,
  hasVideo,
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
  return (
    <div className="video-section">
      <div className="video-inner-container">
        <div className="video-placeholder">
          {joinState === "CONNECTED" && agoraHost && hasVideo && (
            <MediaPlayer
              user={agoraHost}
              hasVideo={hasVideo}
              videoTrack={agoraHost.videoTrack}
              subscribeVideo={subscribeVideo}
              unsubscribeVideo={unsubscribeVideo}
              isHostAudioMuted={isHostAudioMuted}
              toggleHostAudioMute={toggleHostAudioMute}
              onZoomToggle={onZoomToggle}
              isMobileDevice={isMobileDevice}
              videoControlsVisibility={videoControlsVisibility}
              openEmojiModal={openEmojiModal}
              isEmojiLocked={isEmojiLocked}
              allowToSendEmoji={allowToSendEmoji}
            />
          )}
          {((agoraHost && !hasVideo) ||!agoraHost ) && 
            <VideoPlayer 
              onZoomToggle={onZoomToggle}
              isMobileDevice={isMobileDevice}
              videoControlsVisibility={videoControlsVisibility}
              openEmojiModal={openEmojiModal}
              isEmojiLocked={isEmojiLocked}
              allowToSendEmoji={allowToSendEmoji}
            />
          }
        </div>
      </div>
    </div>
  );
};
