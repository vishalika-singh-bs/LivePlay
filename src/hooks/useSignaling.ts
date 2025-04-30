import { useEffect, useCallback } from "react";
import { SignalingManager } from "@livePlay/web-sdk";
import { useAppDispatch, useAppSelector } from "../store";
import { queueMessage, addLocalMessage } from "../store/slices/chatSlice";
import { setUserId, setUserName } from "../store/slices/userSlice";

// Singleton instance of SignalingManager to manage signaling operations
let signalingManagerInstance: SignalingManager | null = null;

/**
 * Retrieves the singleton instance of SignalingManager
 * @returns {SignalingManager} The signaling manager instance
 */
const getSignalingManager = () => {
  if (!signalingManagerInstance) {
    signalingManagerInstance = new SignalingManager();
  }
  return signalingManagerInstance;
};

/**
 * Custom hook for managing signaling interactions
 * Handles message sending and receiving in the signaling channel
 */
const useSignaling = () => {
  const dispatch = useAppDispatch();
  const { userId, username } = useAppSelector((state) => state.user);
  const signalingInstance = getSignalingManager();

  /**
   * Joins the signaling channel and registers event listeners
   * @returns {Promise<void>}
   */
  const join = useCallback(async (userToken: string) => {
    try {
      await signalingInstance.joinSignalingChannel(userToken);
      dispatch(setUserName(signalingInstance.userName ?? ""))
      dispatch(setUserId(signalingInstance.userId ?? ""));
      registerSignalingEvents();
    } catch (error) {
      console.error("Error joining signaling channel:", error);
      throw error;
    }
  }, []);

  /**
   * Handles incoming messages from the signaling channel
   * @param {any} event - The event containing the message data
   */
  const handleMessage = (event: any) => {
    console.log("Received message:", event.message);
    try {
      const payload = JSON.parse(event.message);
      if (
        payload.type === "text" &&
        payload.userId !== signalingInstance.userId
      ) {
        dispatch(
          queueMessage({
            id: `${payload.userId}-${payload.timestamp}`,
            userId: payload.userId,
            userName: payload.userName || "Anonymous",
            message: payload.message,
            timestamp: payload.timestamp,
            isLocal: false,
          })
        );
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  };

  /**
   * Registers event listeners for signaling events
   * Specifically listens for incoming messages
   */
  const registerSignalingEvents = () => {
    signalingInstance.signalingClient.addEventListener(
      "message",
      handleMessage
    );
  };

  /**
   * Sends a message to the signaling channel
   * @param {string} message - The message to be sent
   * @returns {Promise<void>}
   */
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        if (!signalingInstance.signalingChanelName) {
          return;
        }
        const payload = {
          type: "text",
          message,
          timestamp: Date.now(),
          userId: signalingInstance.userId,
          userName: signalingInstance.userName || "Anonymous",
        };

        // Add local message to queue immediately
        dispatch(
          addLocalMessage({
            id: `${userId}-${payload.timestamp}`,
            userId,
            userName: "Me",
            message: message,
            timestamp: payload.timestamp,
            isLocal: true,
          })
        );

        const publishMessage = JSON.stringify(payload);
        await signalingInstance.signalingClient.publish(
          signalingInstance.signalingChanelName,
          publishMessage,
          { channelType: "MESSAGE" }
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [
      userId,
      username,
      dispatch,
      signalingInstance.signalingChanelName,
      signalingInstance.signalingClient,
      signalingInstance.userId,
    ]
  );

  /**
   * Effect hook for cleaning up event listeners on component unmount
   */
  useEffect(() => {
    return () => {
      if (signalingInstance.signalingClient) {
        signalingInstance.signalingClient.removeEventListener(
          "message",
          handleMessage
        );
      }
    };
  }, []);

  // Expose join and sendMessage functions for external use
  return {
    join,
    sendMessage,
  };
};

export default useSignaling;
