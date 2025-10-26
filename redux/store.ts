import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api/baseApi";

const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== "production", // only enable Redux DevTools in dev
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
