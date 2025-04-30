import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppConfigState {
  showChat: boolean;
  showVideo: boolean;
  showAudio: boolean;
  videoMode: string;
  isMediaConnecting: boolean; 
  isChatConnecting: boolean;
  isMediaConnected: boolean;
  isChatConnected: boolean;
  isMediaFailed: boolean;
  isChatFailed: boolean;
  isChatTokenReceived:boolean;
  videoControlsVisibility: boolean;
}

const initialState: AppConfigState = {
  showChat: false,
  showVideo: true,
  showAudio: false,
  videoMode: 'default',
  isMediaConnecting: false,
  isChatConnecting: false,
  isMediaConnected: false,
  isChatConnected: false,
  isMediaFailed: false,
  isChatFailed: false,
  isChatTokenReceived:false,
  videoControlsVisibility: true,
};

const appConfigSlice = createSlice({
  name: 'appConfig',
  initialState,
  reducers: {
    setShowChat: (state) => {
      state.showChat = true;
      state.showVideo = true;
      state.showAudio = false;
    },

    showVideoOnly: (state) => {
      state.showChat = false;
      state.showVideo = true;
      state.showAudio = false;
    },
    changeWidgetMode: (state) => {
      if (state.showVideo) {
        return {
          ...state,
          showChat: false,
          showVideo: false,
          showAudio: true,
        };
      }
      return {
        ...state,
        showChat: false,
        showVideo: true,
        showAudio: false,
      };
    },

    setIsMediaConnecting: (state) => {
      state.isMediaConnecting = true;
    },
    setIsMediaConnected: (state) => {
      state.isMediaConnecting = false;
      state.isMediaConnected = true;
    },
    setIsMediaFailed: (state) => {
      state.isMediaConnecting = false;
      state.isMediaConnected = false;
      state.isMediaFailed = true;
    },
    setIsChatConnecting: (state) => {
      state.isChatConnecting = true;
    },
    setIsChatConnected: (state) => {
      state.isChatConnecting = false;
      state.isChatConnected = true;
    },
    setIsChatFailed: (state) => {
      state.isChatConnecting = false;
      state.isChatConnected = false;
      state.isChatFailed = true;
    },
    setIsChatTokenReceived:(state)=>{
      state.isChatTokenReceived = true
    },
    setVideoControlsVisibility:(state, action: PayloadAction<boolean>)=>{
      state.videoControlsVisibility = action.payload;
    }
  },
});

export const {
  setShowChat,
  showVideoOnly,
  changeWidgetMode,
  setIsMediaConnecting,
  setIsMediaConnected,
  setIsMediaFailed,
  setIsChatConnecting,
  setIsChatConnected,
  setIsChatFailed,
  setIsChatTokenReceived,
  setVideoControlsVisibility,
} = appConfigSlice.actions;
export default appConfigSlice.reducer;
