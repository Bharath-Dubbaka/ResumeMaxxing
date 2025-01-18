import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   userDetails: null,
   userQuota: null,
   loading: false,
   error: null,
};

const firebaseSlice = createSlice({
   name: "firebase",
   initialState,
   reducers: {
      setUserDetails: (state, action) => {
         state.userDetails = action.payload;
         state.loading = false;
      },
      setUserQuota: (state, action) => {
         state.userQuota = action.payload;
      },
      setLoading: (state, action) => {
         state.loading = action.payload;
      },
      setError: (state, action) => {
         state.error = action.payload;
         state.loading = false;
      },
      clearFirebaseData: (state) => {
         state.userDetails = null;
         state.userQuota = null;
         state.loading = false;
         state.error = null;
      },
   },
});

export const {
   setUserDetails,
   setUserQuota,
   setLoading,
   setError,
   clearFirebaseData,
} = firebaseSlice.actions;
export default firebaseSlice.reducer;
