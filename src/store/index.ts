import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import chatReducer from './slices/chatSlice';
import appConfigReducer from './slices/appConfigSlice';
import mediaConfigReducer from './slices/mediaConfigSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    appConfig: appConfigReducer,
    mediaConfig: mediaConfigReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
