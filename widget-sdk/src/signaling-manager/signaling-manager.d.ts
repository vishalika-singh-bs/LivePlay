import { RTMClient } from "agora-rtm-sdk";
export declare class SignalingManager {
    private joinController;
    private signalingEngine;
    constructor();
    joinSignalingChannel(token: string): Promise<void>;
    get signalingClient(): RTMClient;
    get signalingChanelName(): string | null;
    get isSignalingConnected(): boolean;
    get userId(): string | null;
    get userName(): string | null;
}
