import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: string;
  username: string;
  userToken: string;
}

const initialState: UserState = {
  userId: '',
  username: '',
  userToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.userToken = action.payload;
    },
  },
});

export const { setUserId,setUserName,setToken } = userSlice.actions;
export default userSlice.reducer;
