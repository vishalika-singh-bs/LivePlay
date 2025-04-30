import { useCallback, useEffect, useState } from "react";
import {
  IAgoraRTCRemoteUser,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { AgoraRTC, MediaManager } from "@livePlay/web-sdk";

let mediaManagerInstance: MediaManager | null = null;

const getMediaManager = () => {
  if (!mediaManagerInstance) {
    mediaManagerInstance = new MediaManager();
  }
  return mediaManagerInstance;
};
/**
 * Custom hook for managing Agora RTC media interactions
 * Handles audio/video tracks, user events, and connection states
 */
const useMedia = () => {
  const [agoraHost, setAgoraHost] = useState<IAgoraRTCRemoteUser | null>(null);
  const [joinState, setJoinState] = useState("");
  const [clientRole] = useState<string>("host");
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [audioTrack, setAudioTrack] = useState<IRemoteAudioTrack | null>(null);
  const [isHostAudioMuted, setIsHostAudioMuted] = useState<boolean>(false);
  const [isAutoPlayFailed, setIsAutoPlayFailed] = useState<boolean>(false);
  const mediaInstance = getMediaManager();

  /**
   * Initiates connection to the Agora RTC channel
   * @returns {Promise<void>}
   */
  const join = useCallback(async (token:string) => {
    try {
      await mediaInstance.joinRTCChannel(token);
      console.log("Media joined");
      setJoinState("CONNECTED");
    } catch (error) {
      console.error("Error joining media:", error);
      setJoinState("FAILED");
      throw error;
    }
  }, []);

  /**
   * Subscribes to remote video track
   * @param {IAgoraRTCRemoteUser} user - Remote user to subscribe to
   * @returns {Promise<void>}
   */
  const subscribeVideo = useCallback(
    async (user: IAgoraRTCRemoteUser): Promise<IRemoteVideoTrack> => {
      try {
        const track = await mediaInstance.mediaClient?.subscribe(user, "video");
        return track;
      } catch (error) {
        console.error("Error subscribing to video:", error);
        throw error;
      }
    },
    [mediaInstance.mediaClient]
  );

  /**
   * Unsubscribes from remote video track
   * @param {IAgoraRTCRemoteUser} user - Remote user to unsubscribe from
   * @returns {Promise<void>}
   */
  const unsubscribeVideo = useCallback(
    async (user: IAgoraRTCRemoteUser): Promise<IRemoteVideoTrack> => {
      try {
        const track = await mediaInstance.mediaClient?.unsubscribe(
          user,
          "video"
        );
        return track as any;
      } catch (error) {
        console.error("Error subscribing to video:", error);
        throw error;
      }
    },
    [mediaInstance.mediaClient]
  );

  /**
   * Handles channel disconnection and cleanup
   * @returns {Promise<void>}
   */
  const handleLeaveChannel = useCallback(async () => {
    setJoinState("DISCONNECTED");
    setAgoraHost(null);
    try {
      await mediaInstance.mediaClient?.leave();
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  }, []);

  /**
   * Toggles host audio mute state
   * Handles autoplay failure recovery and normal mute/unmute operations
   */
  const toggleHostAudioMute = useCallback(() => {
    if (!audioTrack) return;
    console.log("isAutoPlayFailed", isAutoPlayFailed);
    if (audioTrack.isPlaying && isAutoPlayFailed) {
      setIsAutoPlayFailed(false);
      setIsHostAudioMuted(false);
      return;
    }
    if (audioTrack.isPlaying) {
      setIsHostAudioMuted(true);
      audioTrack.stop();
    } else {
      setIsHostAudioMuted(false);
      audioTrack.play();
    }
  }, [audioTrack, isAutoPlayFailed]);

    /**
   * Toggles host audio mute state
   * Handles autoplay failure recovery and normal mute/unmute operations
   */
    const setAudioVolume = useCallback((audioVolume: number) => {
      if (!audioTrack) return;
      audioTrack.setVolume(audioVolume);
    }, [audioTrack]);

  /**
   * Effect hook to handle Agora client events
   * Manages user publishing, unpublishing, and connection events
   */
  useEffect(() => {
    const client = mediaInstance?.mediaClient;
    if (!client) return;

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "audio") {
        const audioTrack = await mediaInstance.mediaClient?.subscribe(
          user,
          mediaType
        );
        setAudioTrack(audioTrack);
        try {
          audioTrack.play();
          setHasAudio(true);
          setIsHostAudioMuted(false);
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsHostAudioMuted(true);
        }
      } else if (mediaType === "video") {
        setHasVideo(true);
      }
      setAgoraHost(user);
    };

    const handleUserUnpublished = (
      _user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "audio") {
        setHasAudio(false);
        setAudioTrack(null);
      } else if (mediaType === "video") {
        setHasVideo(false);
      }
    };

    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      setAgoraHost(user);
    };

    const handleUserLeft = () => {
      setAgoraHost(null);
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
    };
  }, [mediaInstance?.mediaClient]);

  /**
   * Effect hook to handle autoplay failures
   * Sets appropriate states when browser blocks autoplay
   */
  useEffect(() => {
    AgoraRTC.onAutoplayFailed = () => {
      setIsHostAudioMuted(true);
      setIsAutoPlayFailed(true);
    };
  }, []);

  return {
    join,
    subscribeVideo,
    unsubscribeVideo,
    handleLeaveChannel,
    joinState,
    clientRole,
    agoraHost,
    hasVideo,
    toggleHostAudioMute,
    setAudioVolume,
    hasAudio,
    isHostAudioMuted,
  };
};

export default useMedia;
