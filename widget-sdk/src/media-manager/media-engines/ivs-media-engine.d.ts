import { Stage } from 'amazon-ivs-web-broadcast';
export declare class IVSMediaEngine {
    private stage?;
    private isJoined;
    private isJoining;
    constructor();
    joinRTCChannel(token: string): Promise<void>;
    leaveStage(): Promise<void>;
    get mediaClient(): Stage | undefined;
}
