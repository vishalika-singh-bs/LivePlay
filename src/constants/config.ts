export type StreamingType = "AMAZON_LATENCY" | "AMAZON_REALTIME" | "AGORA";

export const STREAMING_TYPE: StreamingType = "AMAZON_LATENCY"; // Change as needed

// Agora Streaming
export const AGORA_STREAMING = {
    defaultVideoUrl: 'https://lpm-public-files.s3.us-west-2.amazonaws.com/Haley+on+LPB+BG+with+Audio+(1).mp4',
};

// Amazon IVS (Latency Streaming)
export const AMAZON_LATENCY_STREAMING = {
    playbackUrl: "https://37c9445dfd56.us-west-2.playback.live-video.net/api/video/v1/us-west-2.926856021716.channel.WNsjoC3d16Sj.m3u8",
};

// Amazon IVS Real-Time Streaming
//   export const AMAZON_REALTIME_STREAMING = {
//     stageArn: "arn:aws:ivs:us-west-2:your-account-id:stage/your-stage-id", // Required for real-time stages
//     ingestEndpoint: "wss://your-stage-endpoint.ivs.us-west-2.amazonaws.com", // WebSocket endpoint for participant connection
//     participantToken: "your-generated-token", // Generated via AWS SDK or backend
//     channelName: "RealtimeStreamingStage",
//   };

