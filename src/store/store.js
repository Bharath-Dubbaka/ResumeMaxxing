import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import firebaseReducer from "./slices/firebaseSlice";

export const store = configureStore({
   reducer: {
      auth: authReducer,
      firebase: firebaseReducer,
   },
});
