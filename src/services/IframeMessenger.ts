import { IframeMessage, MessageCallback, MessageType } from '../types/messages';

class IframeMessenger {
  private static instance: IframeMessenger;
  private callbacks: Map<MessageType, Set<MessageCallback>>;
  private pendingRequests: Map<string, { resolve: Function; reject: Function }>;

   constructor() {
    this.callbacks = new Map();
    this.pendingRequests = new Map();
    this.initMessageListener();
  }

  public static getInstance(): IframeMessenger {
    if (!IframeMessenger.instance) {
      IframeMessenger.instance = new IframeMessenger();
    }
    return IframeMessenger.instance;
  }

  private initMessageListener(): void {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent): void {
    console.log('Received message:', event.data, 'from origin:', event.origin);
    const message = event.data as IframeMessage;
    
    // Validate message format
    if (!message || !message.type) return;

    // Handle pending requests
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const { resolve, reject } = this.pendingRequests.get(message.requestId)!;
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message.payload);
      }
      this.pendingRequests.delete(message.requestId);
      return;
    }

    // Notify all callbacks registered for this message type
    const callbacks = this.callbacks.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }

  public subscribe(type: MessageType, callback: MessageCallback): () => void {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }
    this.callbacks.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(type);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  public async sendMessage(message: IframeMessage): Promise<any> {
    window.parent.postMessage(message, '*');
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.callbacks.clear();
  }
}

export default IframeMessenger;
