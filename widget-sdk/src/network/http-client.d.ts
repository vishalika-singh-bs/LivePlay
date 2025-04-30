export interface IRequestOptions {
    cache?: RequestCache;
    credentials?: RequestCredentials;
    integrity?: string;
    keepalive?: boolean;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal | null;
    window?: null;
}
declare class HttpClientClass {
    /**
     * Performs a GET request to the specified URL with optional request options
     * @param {string} url - The URL to perform the GET request to
     * @param {IRequestOptions} options - Optional request options such as headers and timeout
     * @returns {Promise<any>} - A Promise that resolves to the response body of the GET request
     */
    createGetRequest(url: string, options?: IRequestOptions): Promise<any>;
    createPostRequest(url: string, body: any, options?: IRequestOptions): Promise<any>;
}
export declare const HttpClient: HttpClientClass;
export {};
