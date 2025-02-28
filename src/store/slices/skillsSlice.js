import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   skills: [],
   skillsMapped: [],
   combinedSkills: [],
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
      setCombinedSkills: (state, action) => {
         state.combinedSkills = action.payload;
      },
   },
});

export const { setSkills, setSkillsMapped, setCombinedSkills } = skillsSlice.actions;
export default skillsSlice.reducer;
