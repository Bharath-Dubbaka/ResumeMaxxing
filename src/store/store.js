import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import firebaseReducer from "./slices/firebaseSlice";
import skillsReducer from "./slices/skillsSlice";
import { createAuthMiddleware } from "./middleware/authMiddleware";

export const store = configureStore({
   reducer: {
      auth: authReducer,
      firebase: firebaseReducer,
      skills: skillsReducer,
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false,
      }).concat(createAuthMiddleware),
});
