import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MediaConfigState {
  isAutoPlayFailed: boolean;
  audioVolume: number;
}

const initialState: MediaConfigState = {
  isAutoPlayFailed: false,
  audioVolume: 100,
};

const mediaConfigSlice = createSlice({
  name: 'mediaConfig',
  initialState,
  reducers: {
    setAutoPlayFailed: (state, action: PayloadAction<boolean>) => {
      state.isAutoPlayFailed = action.payload;
    },
    setAudioVolume: (state, action: PayloadAction<number>) => {
      state.audioVolume = action.payload;
    },
  },
});

export const { 
  setAutoPlayFailed,
  setAudioVolume,
} = mediaConfigSlice.actions;
export default mediaConfigSlice.reducer;
