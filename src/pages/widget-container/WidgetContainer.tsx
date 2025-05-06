import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { ChatSection } from "../../components/chat-section/ChatSection";
import useMedia from "../../hooks/useMedia";
import useSignaling from "../../hooks/useSignaling";
import { AudioSection } from "../../components/audio-section/AudioSection";
import { VideoSection } from "../../components/video-section/VideoSection";
import { EmojiSection } from "../../components/emoji-section/EmojiSection";
import useIframeMessenger from "../../hooks/useIframeMessenger";
import { WIDGET_EVENTS } from "../../constants/actions";
import { 
  setIsChatConnected,
  setIsChatConnecting,
  setIsChatFailed,
  setIsMediaConnected,
  setIsMediaConnecting,
  setIsMediaFailed,
  setVideoControlsVisibility 
} from "../../store/slices/appConfigSlice";
import "./WidgetContainer.css";
import { STREAMING_TYPE,AMAZON_REALTIME_STREAMING } from "../../constants/config";

export const WidgetContainer = () => {
  const { videoControlsVisibility, showVideo, showAudio, isChatConnected} = useAppSelector(
    (state) => state.appConfig
  );
  const { audioVolume } = useAppSelector((state) => state.mediaConfig);
  const { userToken } = useAppSelector((state) => state.user);
  const engineType = STREAMING_TYPE === "AMAZON_REALTIME" ? 'ivs' : 'agora';
  
  const {
    join: joinMedia,
    agoraHost,
    videoTrack,
    subscribeVideo,
    joinState,
    hasVideo,
    unsubscribeVideo,
    isHostAudioMuted,
    toggleHostAudioMute,
    setAudioVolume,
  } = useMedia(engineType);
  const emojiOpenModalTimeoutRef = useRef<number | null>(null);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [isEmojiLocked, setIsEmojiLocked] = useState(false);
  const { join: joinSignaling, sendMessage } = useSignaling();
  const [isLandscape, setIsLandscape] = useState(false);
  const containerRef = useRef(null);
  const { sendMessageToParent } = useIframeMessenger();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setAudioVolume(audioVolume);
  }, [audioVolume]);

  const startMedia = useCallback(
    async (token: string) => {
      try {
        sendMessageToParent({
          type: WIDGET_EVENTS.MEDIA_CONNECTING,
        }); 
        dispatch(setIsMediaConnecting());
        await joinMedia(token); // Function to join the media channel
        sendMessageToParent({
          type: WIDGET_EVENTS.MEDIA_CONNECTED,
        });
        dispatch(setIsMediaConnected());
      } catch (error) {
        sendMessageToParent({
          type: WIDGET_EVENTS.MEDIA_CONNECTION_FAILED,
        });
        setIsMediaFailed();
        throw error;
      }
    },
    [joinMedia, sendMessageToParent,dispatch]
  );
  
  const startChat = useCallback(
    async (token: string) => {
      try {
        sendMessageToParent({
          type: WIDGET_EVENTS.CHAT_CONNECTING,
        });     
        dispatch(setIsChatConnecting());
        await joinSignaling(token); // Function to join the chat channel
        sendMessageToParent({
          type: WIDGET_EVENTS.CHAT_CONNECTED,
        });
        dispatch(setIsChatConnected(  ));
      } catch (error) {
        sendMessageToParent({
          type: WIDGET_EVENTS.CHAT_CONNECTION_FAILED,
        });
        dispatch(setIsChatFailed());
        throw error;
      }
    },
    [joinSignaling, sendMessageToParent,dispatch]
  );
  
  const startChatAndMedia = useCallback(
    async (token: string) => {
      try {
        await Promise.all([startMedia(token), startChat(token)]);
      } catch (error) {
        console.error("Error starting chat or media:", error);
      }
    },
    [startMedia, startChat]
  );
  
  useEffect(() => {
    if (userToken) {
      startChatAndMedia(userToken);
    }
    if(STREAMING_TYPE === "AMAZON_REALTIME"){
      startMedia(AMAZON_REALTIME_STREAMING.participantToken)
    }
  }, [userToken, startChatAndMedia]);

  const updateLayout = () => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setIsLandscape(offsetWidth > offsetHeight);
    }
  };

  useEffect(() => {
    updateLayout(); // Check the layout initially
    window.addEventListener("resize", updateLayout); // Listen for parent container size changes
    return () => window.removeEventListener("resize", updateLayout); // Cleanup
  }, []);

  const isMobileDevice = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    if(isMobileDevice()) {
      dispatch(setVideoControlsVisibility(false));
    }
  }, []);

  const handleEmojiSelected = (emoji: string) => {
    if (!emoji) {
      return;
    }
    sendMessage(emoji);
    sendMessageToParent({
      type: WIDGET_EVENTS.EMOJI_SELECTED,
      payload: {
        emoji: emoji,
      },
    });
  };

  const onZoomToggle = (zoomed: boolean) => {
    sendMessageToParent({
      type: WIDGET_EVENTS.RESIZE_WIDGET,
      payload: {
        resize: zoomed ? 'expand' : 'contract',
      },
    });
  };

  const openEmojiModal = () => {
    if (isEmojiLocked) {
      return;
    }
    setIsEmojiModalOpen(true);
    sendMessageToParent({
      type: WIDGET_EVENTS.EMOJI_MODEL_OPENED,
      payload: {
        opened: true,
      },
    });
    emojiOpenModalTimeoutRef.current = setTimeout(() => {
      closeEmojiModal();
    }, 3000);
  };
  const closeEmojiModal = () => {
    sendMessageToParent({
      type: WIDGET_EVENTS.EMOJI_MODEL_OPENED,
      payload: {
        opened: false,
      },
    });
    setIsEmojiModalOpen(false);
    clearTimeout(emojiOpenModalTimeoutRef.current ?? undefined);
  };

  const handleLockStatusChange = (locked: boolean) => {
    setIsEmojiLocked(locked);
  };
  
  return (
    <div
      ref={containerRef}
      className={`widget-container ${isLandscape ? "landscape" : "portrait"}`}
    >
      {showVideo && (
        <VideoSection
          agoraHost={agoraHost}
          videoTrack={videoTrack}
          subscribeVideo={subscribeVideo}
          joinState={joinState}
          hasVideo={hasVideo}
          unsubscribeVideo={unsubscribeVideo}
          isHostAudioMuted={isHostAudioMuted}
          toggleHostAudioMute={toggleHostAudioMute}
          onZoomToggle={onZoomToggle}
          isMobileDevice={isMobileDevice()}
          videoControlsVisibility={videoControlsVisibility}
          openEmojiModal={openEmojiModal}
          isEmojiLocked={isEmojiLocked}
          allowToSendEmoji={isChatConnected}
        />
      )}
      {showAudio && <AudioSection />}
      {!isMobileDevice() && <ChatSection sendMessage={sendMessage} />}
      {isMobileDevice() && showVideo && 
        <EmojiSection 
          onEmojiSelected={handleEmojiSelected} 
          closeEmojiModal={closeEmojiModal}
          onLockStatusChange={handleLockStatusChange}
          isOpen={isEmojiModalOpen}
        /> 
      }
    </div>
  );
};
