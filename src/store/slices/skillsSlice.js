import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   skills: [],
   skillsMapped: [],
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
      setSkillsMapped: (state, action) => {
         state.skillsMapped = action.payload;
      },
   },
});

export const { setSkills, setSkillsMapped, clearSkills } = skillsSlice.actions;
export default skillsSlice.reducer;
