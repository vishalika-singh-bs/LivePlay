export type StreamingType = "AMAZON_LATENCY" | "AMAZON_REALTIME" | "AGORA";

export const STREAMING_TYPE: StreamingType = import.meta.env.VITE_STREAMING_TYPE as StreamingType;

// Agora Streaming
export const AGORA_STREAMING = {
    defaultVideoUrl: import.meta.env.VITE_AGORA_DEFAULT_VIDEO_URL!,
};

// Amazon IVS (Latency Streaming)
export const AMAZON_LATENCY_STREAMING = {
    playbackUrl: import.meta.env.VITE_IVS_LATENCY_PLAYBACK_URL!,
};

// Amazon IVS Real-Time Streaming
export const AMAZON_REALTIME_STREAMING = {
    stageArn: import.meta.env.VITE_IVS_STAGE_ARN!,
    ingestEndpoint: import.meta.env.VITE_IVS_INGEST_ENDPOINT!,
    participantToken: import.meta.env.VITE_IVS_PARTICIPANT_TOKEN!,
    channelName: import.meta.env.VITE_IVS_CHANNEL_NAME!,
};
