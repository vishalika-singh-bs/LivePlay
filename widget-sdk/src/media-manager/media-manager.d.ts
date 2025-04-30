import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
export declare class MediaManager {
    private joinController;
    private mediaEngine;
    constructor();
    joinRTCChannel(token: string): Promise<void>;
    get mediaClient(): IAgoraRTCClient;
}
