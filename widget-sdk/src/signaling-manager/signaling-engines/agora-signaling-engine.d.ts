import { IJoinMeeting } from "@livePlay/web-sdk/join-controller/join-controller.interface";
import { RTMClient } from "agora-rtm-sdk";
export declare class AgoraSignalingEngine {
    private agoraSignalingClient;
    signalingChanelName: string | null;
    isSignalingConnected: boolean;
    userId: string | null;
    userName: string | null;
    joinSignalingChannel(channelDetails: IJoinMeeting): Promise<void>;
    handleSubscribe(): Promise<void>;
    get signalingClient(): RTMClient;
}
