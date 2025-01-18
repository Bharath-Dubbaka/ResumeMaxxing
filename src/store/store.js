import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import firebaseReducer from "./slices/firebaseSlice";
import { createAuthMiddleware } from "./middleware/authMiddleware";

export const store = configureStore({
   reducer: {
      auth: authReducer,
      firebase: firebaseReducer,
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false,
      }).concat(createAuthMiddleware),
});
