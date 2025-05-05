import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
type EngineType = "agora" | "ivs";
export declare class MediaManager {
    private joinController;
    private agoraEngine;
    private ivsEngine;
    private activeEngineType;
    constructor(engine: EngineType);
    joinRTCChannel(token: string): Promise<void>;
    get mediaClient(): IAgoraRTCClient | undefined;
    get ivsClient(): any;
}
export {};
