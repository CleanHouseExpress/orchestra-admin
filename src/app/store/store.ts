import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import companiesReducer from "./companiesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
