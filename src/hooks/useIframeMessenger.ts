import { useEffect, useCallback, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { setToken } from "../store/slices/userSlice";
import { WIDGET_EVENTS } from "../constants/actions";
import IframeMessenger from "../services/IframeMessenger";
import { changeWidgetMode, setIsChatTokenReceived, setShowChat, setVideoControlsVisibility } from "../store/slices/appConfigSlice";
import { setAudioVolume } from "../store/slices/mediaConfigSlice";
import { IframeMessage } from "../types/messages";

/**
 * Custom hook for managing communication with the parent iframe
 * Handles message sending and receiving between the widget and the parent
 */
export default function useIframeMessenger() {
  const dispatch = useAppDispatch();

  // Select application configuration state
  const { showChat, showVideo, showAudio } = useAppSelector(
    (state) => state.appConfig
  );

  // Select user information from the state
  const { userId, username } = useAppSelector((state) => state.user);
  const messengerRef = useRef<IframeMessenger | null>(null);

  const messenger = useMemo(() => {
    if (!messengerRef.current) {
      messengerRef.current = new IframeMessenger();
    }
    return messengerRef.current;
  }, []);

  /**
   * Handles incoming messages from the parent iframe
   * @param {MessageEvent} event - The message event containing data
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      console.log("Received message:", event.data);
      const { type, payload } = event.data;
      switch (type) {
        case "TOGGLE_CHAT":
          dispatch(setShowChat(payload));
          break;
        case "CYCLE_WIDGET_MODE":
          dispatch(changeWidgetMode());
          break;
        case "ACCESS_TOKEN":
          dispatch(setToken(payload));
          dispatch(setIsChatTokenReceived(payload));
          break;
        case "FONT_SIZE":
          document.documentElement.style.fontSize = payload; // Update <html>
          document.body.style.fontSize = payload;   
          break;
        case "SET_AUDIO_VOLUME":
          dispatch(setAudioVolume(payload));
          break;
        case "SET_VIDEO_CONTROLS_VISIBILITY":
          dispatch(setVideoControlsVisibility(payload));
          break;
        default:
          break;
      }
    },
    [dispatch]
  );

  /**
   * Sends a message to the parent iframe
   * @param {IframeMessage} message - The message to be sent
   */
  const sendMessageToParent = useCallback(
    async (message: IframeMessage) => {
      try {
        await messenger.sendMessage(message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [messenger]
  );

  // Effect to set up message event listener
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  // Effect to send state updates to the parent iframe
  useEffect(() => {
    // Determine current widget mode
    let currentAction: string = WIDGET_EVENTS.SHOW_CHAT_VIDEO;
    if (!showChat && showVideo) {
      currentAction = WIDGET_EVENTS.SHOW_VIDEO_ONLY;
    } else if (!showChat && !showVideo && showAudio) {
      currentAction = WIDGET_EVENTS.SHOW_AUDIO_ONLY;
    }
    // Send update to parent iframe
    sendMessageToParent({
      type: WIDGET_EVENTS.STATE_UPDATE,
      payload: {
        currentAction,
        state: {
          showChat,
          showVideo,
          showAudio,
        },
      },
    }).catch((error) => {
      console.error("Error sending state update to parent:", error);
    });
  }, [showChat, showVideo, showAudio, sendMessageToParent]);

  return {
    sendMessageToParent,
    userId,
    username,
  };
}
