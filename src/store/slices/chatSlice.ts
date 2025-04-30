import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types/chat';

interface ChatState {
  messages: ChatMessage[]; // Displayed messages
  messageQueue: ChatMessage[]; // Incoming message queue
  paused: boolean; // Indicates if scrolling is paused
  unreadCount: number; // Number of unread messages while paused
  batchSize: number;
  maxMessages: number
  }

const initialState: ChatState = {
  messages: [],
  messageQueue: [],
  paused: false,
  unreadCount: 0,
  batchSize:10,
  maxMessages :100,

};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    queueMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messageQueue.push(action.payload);
    },

    // Process a batch of queued messages
    processQueue: (state) => {
      const toAdd = state.messageQueue.splice(0, state.batchSize); // Remove messages from the messageQueue
      state.messages.push(...toAdd);

      // Trim messages to the last 100
      if (state.messages.length > state.maxMessages) {
        state.messages.splice(0, state.messages.length - state.maxMessages);
      }
    },

    // Add a local message directly to the messages array
    addLocalMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);

      // Trim messages to the last 100
      const maxMessages = 100;
      if (state.messages.length > maxMessages) {
        state.messages.splice(0, state.messages.length - maxMessages);
      }
    },
    togglePause: (state, action: PayloadAction<boolean>) => {
      state.paused = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.messageQueue = [];
    },
  },
});

export const { queueMessage, processQueue, clearMessages ,addLocalMessage,togglePause} = chatSlice.actions;
export default chatSlice.reducer;
