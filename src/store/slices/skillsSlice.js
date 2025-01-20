import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  skills: [],
  loading: false,
  error: null,
};

const skillsSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    setSkills: (state, action) => {
      state.skills = action.payload;
    },
  },
});

export const { setSkills, clearSkills } = skillsSlice.actions;
export default skillsSlice.reducer;