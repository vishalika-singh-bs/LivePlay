export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  isLocal: boolean,

}

export interface MessageQueue {
  messages: ChatMessage[];
  maxMessages: number;
  updateInterval: number;
}
