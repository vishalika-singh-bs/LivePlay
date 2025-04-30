import { IJoinMeeting } from "@livePlay/web-sdk/join-controller/join-controller.interface";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
export declare class AgoraMediaEngine {
    private agoraRTCClient;
    constructor();
    setLowStreamParameter(): Promise<void>;
    enableDualMode(): Promise<void>;
    joinRTCChannel(channelDetails: IJoinMeeting): Promise<void>;
    get mediaClient(): IAgoraRTCClient;
}
