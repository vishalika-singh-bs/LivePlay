export type MessageType = 
  | 'TOGGLE_VIDEO'
  | 'TOGGLE_AUDIO'
  | 'TOGGLE_CHAT'
  | 'STATE_UPDATE'
  | 'MEDIA_CONNECTING'
  | 'MEDIA_CONNECTED'
  | 'MEDIA_CONNECTION_FAILED'
  | 'CHAT_CONNECTING'
  | 'CHAT_CONNECTED'
  | 'CHAT_CONNECTION_FAILED'
  | 'EMOJI_SELECTED'
  | 'EMOJI_MODEL_OPENED'
  | 'RESIZE_WIDGET';

export interface IframeMessage {
  type: MessageType;
  payload?: any;
  error?: string;
  requestId?: string;
}

export interface StateUpdate {
  showVideo: boolean;
  showAudio: boolean;
  showChat: boolean;
  channelId?: string;
  userId?: string;
}

export type MessageCallback = (message: IframeMessage) => void;
