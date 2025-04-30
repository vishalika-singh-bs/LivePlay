import { NetworkApi } from "../network/network-api";
declare class JoinControllerClass {
    private networkApi;
    constructor(networkApi: NetworkApi);
    fetchRTCToken(token: string): Promise<any>;
    fetchSignalingToken(token: string): Promise<any>;
}
export declare const JoinController: JoinControllerClass;
export {};
