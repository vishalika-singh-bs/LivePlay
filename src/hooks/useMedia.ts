import { useCallback, useEffect, useState } from "react";
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCClient
} from "agora-rtc-sdk-ng";
import { MediaManager } from "@livePlay/web-sdk";
import {
  Stage,
  StageEvents,
  StageParticipantInfo,
  RemoteStageStream,
  StageStream,
  StageParticipantSubscribeState
} from 'amazon-ivs-web-broadcast';

let mediaManagerInstance: MediaManager | null = null;

const getMediaManager = (engine: "agora" | "ivs") => {
  if (!mediaManagerInstance) {
    mediaManagerInstance = new MediaManager(engine);
  }
  return mediaManagerInstance;
};
/**
 * Custom hook for managing Agora RTC media interactions
 * Handles audio/video tracks, user events, and connection states
 */
const useMedia = (engineType: "agora" | "ivs" = "agora") => {
  const [agoraHost, setAgoraHost] = useState<IAgoraRTCRemoteUser | null>(null);
  const [joinState, setJoinState] = useState("");
  const [clientRole] = useState<string>("host");
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [audioTrack, setAudioTrack] = useState<IRemoteAudioTrack | null>(null);
  const [isHostAudioMuted, setIsHostAudioMuted] = useState<boolean>(false);
  const [isAutoPlayFailed, setIsAutoPlayFailed] = useState<boolean>(false);

  const mediaInstance = getMediaManager(engineType);
  const mediaClient: IAgoraRTCClient | any = mediaInstance.mediaClient;
  const client = mediaInstance.ivsClient;
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);

  /**
   * Initiates connection to the Agora RTC channel
   * @returns {Promise<void>}
   */
  const join = useCallback(async (token: string) => {
    try {
      await mediaInstance.joinRTCChannel(token);
      console.log("Media joined");
      setJoinState("CONNECTED");
    } catch (error) {
      console.error("Error joining media:", error);
      setJoinState("FAILED");
      throw error;
    }
  }, [mediaInstance]);

  /**
   * Subscribes to remote video track
   * @param {IAgoraRTCRemoteUser} user - Remote user to subscribe to
   * @returns {Promise<void>}
   */
  const subscribeVideo = useCallback(
    async (user: IAgoraRTCRemoteUser): Promise<IRemoteVideoTrack> => {
      if (!mediaClient) throw new Error("Media client is not available for the current engine");
      try {
        const track = await mediaClient?.subscribe(user, "video");
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
      if (!mediaClient) throw new Error("Media client is not available for the current engine");
      try {
        const track = await mediaClient?.unsubscribe(
          user,
          "video"
        );
        return track as any;
      } catch (error) {
        console.error("Error subscribing to video:", error);
        throw error;
      }
    },
    [mediaClient]
  );

  /**
   * Handles channel disconnection and cleanup
   * @returns {Promise<void>}
   */
  const handleLeaveChannel = useCallback(async () => {
    setJoinState("DISCONNECTED");
    setAgoraHost(null);
    try {
      await mediaClient?.leave();
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  }, [mediaClient]);

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
    if (!mediaClient) return;

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (mediaType === "audio") {
        const audioTrack = await mediaClient?.subscribe(
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

    mediaClient.on("user-published", handleUserPublished);
    mediaClient.on("user-unpublished", handleUserUnpublished);
    mediaClient.on("user-joined", handleUserJoined);
    mediaClient.on("user-left", handleUserLeft);

    return () => {
      mediaClient.off("user-published", handleUserPublished);
      mediaClient.off("user-unpublished", handleUserUnpublished);
      mediaClient.off("user-joined", handleUserJoined);
      mediaClient.off("user-left", handleUserLeft);
    };
  }, [mediaInstance?.mediaClient]);

  /**
   * Effect hook to handle autoplay failures
   * Sets appropriate states when browser blocks autoplay
   */
  useEffect(() => {
    if (engineType === "agora") {
      AgoraRTC.onAutoplayFailed = () => {
        setIsHostAudioMuted(true);
        setIsAutoPlayFailed(true);
      };
    }
  }, [engineType]);


  useEffect(() => {
    if (engineType !== "ivs") return;
    // Safe cast now
    // Runtime type check and cast through `unknown`
    if (!client) return;
    const ivsStage = client as Stage;
    
    const onParticipantJoined = (participant: StageParticipantInfo) => {
      console.log("[IVS] Participant joined:", participant);
    };

    const onParticipantLeft = (participant: StageParticipantInfo) => {
      console.log("[IVS] Participant left:", participant);
    };

    const onError = (error: Error) => {
      console.error("[IVS] Connection error:", error);
    };

    const onStreamsAdded = (
      participant: StageParticipantInfo,
      streams: StageStream<any>[]
    ) => {
      console.log("[IVS] Streams added for participant:", participant, streams);

      const remoteStreams = streams as RemoteStageStream[];

      remoteStreams.forEach((stream) => {
        const mediaStream = new MediaStream([stream.mediaStreamTrack]);
    
        if (stream.mediaStreamTrack.kind === "video") {
          setVideoTrack(stream.mediaStreamTrack as any); // Replace with stricter type if needed
          setHasVideo(true);    
        }

        if (stream.mediaStreamTrack.kind === "audio") {
          const audioElement = document.createElement("audio");
          audioElement.srcObject = mediaStream;
          audioElement.autoplay = true;
          setAudioTrack(stream.mediaStreamTrack as any); // Replace with stricter type if needed
          setHasAudio(true);
          setIsHostAudioMuted(true)
        }
      });
    };

    const onStreamsRemoved = (
      participant: StageParticipantInfo,
      streams: StageStream<any>[]
    ) => {
      console.log("[IVS] Streams removed for participant:", participant);
      streams.forEach((stream) => {
        if (stream.mediaStreamTrack.kind === "video") {
          setHasVideo(false);
          setVideoTrack(null)
          // Optionally, remove video element if you appended it manually
          const videos = document.querySelectorAll("video");
          videos.forEach((v) => v.remove());
        }
        if (stream.mediaStreamTrack.kind === "audio") {
          setHasAudio(false);
          setAudioTrack(null);
        }
      });
    };

    const onSubscribeStateChanged = (
      participant: StageParticipantInfo,
      state: StageParticipantSubscribeState
    ): void => {
      console.log("[IVS] Subscribe state changed for participant:", participant.id);
      console.log("[IVS] New subscribe state:", state);
      if (state === StageParticipantSubscribeState.ERRORED) {
        console.error('[IVS] Subscribe failed for participant:', participant.id);
        // Implement retry logic or user notification
      }
    };
    

    ivsStage.on(StageEvents.STAGE_PARTICIPANT_JOINED, onParticipantJoined);
    ivsStage.on(StageEvents.STAGE_PARTICIPANT_LEFT, onParticipantLeft);
    ivsStage.on(StageEvents.ERROR, onError);
    ivsStage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onStreamsAdded);
    ivsStage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, onStreamsRemoved);
    ivsStage.on(StageEvents.STAGE_PARTICIPANT_SUBSCRIBE_STATE_CHANGED, onSubscribeStateChanged);


    return () => {
      ivsStage.off(StageEvents.STAGE_PARTICIPANT_JOINED, onParticipantJoined);
      ivsStage.off(StageEvents.STAGE_PARTICIPANT_LEFT, onParticipantLeft);
      ivsStage.off(StageEvents.ERROR, onError);
      ivsStage.off(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onStreamsAdded);
      ivsStage.off(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, onStreamsRemoved);
      ivsStage.off(StageEvents.STAGE_PARTICIPANT_SUBSCRIBE_STATE_CHANGED, onSubscribeStateChanged);

    };
  }, [engineType, client]);


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
    videoTrack
  };
};

export default useMedia;
