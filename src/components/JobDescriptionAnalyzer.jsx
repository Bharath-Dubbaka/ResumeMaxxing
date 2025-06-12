"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";
import { useSelector, useDispatch } from "react-redux";
import { QuotaService } from "../services/QuotaService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setSkills } from "../store/slices/skillsSlice";
import { setSkillsMapped } from "../store/slices/skillsSlice";
import { MapIcon, Trash2, PlusCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import OpenAI from "openai";
import { UserDetailsService } from "../services/UserDetailsService";
import { setUserDetails } from "../store/slices/firebaseSlice";

const genAI = new GoogleGenerativeAI(
   process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
);

const openai = new OpenAI({
   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
   dangerouslyAllowBrowser: true,
});

export default function JobDescriptionAnalyzer() {
   const { user } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const [jobDescription, setJobDescription] = useState("");
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [analysis, setAnalysis] = useState(null);
   const dispatch = useDispatch();
   const [openDropdown, setOpenDropdown] = useState(null);
   const [skillMappings, setSkillMappings] = useState([]);
   const dropdownRef = useRef(null); // Add ref for dropdown
   const [combinedSkills, setCombinedSkills] = useState([]);
   // console.log("test")

   // Add this useEffect to clean up duplicates when the component mounts
   useEffect(() => {
      if (skillMappings.length > 0) {
         removeDuplicateSkillMappings();
      }
   }, []);

   // Add click outside handler
   useEffect(() => {
      function handleClickOutside(event) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
         ) {
            setOpenDropdown(null);
         }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   useEffect(() => {
      if (analysis?.technicalSkills && userDetails) {
         // Combine generated skills with custom skills
         const allSkills = [
            ...analysis.technicalSkills,
            ...(userDetails.customSkills?.map((cs) => cs.skill) || []),
         ];

         setSkillMappings((prev) => {
            const allExperienceTitles = userDetails.experience.map(
               (exp) => exp.title
            );

            // Create mappings for all skills while preserving existing mappings
            const updatedMappings = allSkills.map((skill) => {
               const existingMapping = prev.find((m) => m.skill === skill);
               // If it's a custom skill, use its existing mappings
               const customSkill = userDetails.customSkills?.find(
                  (cs) => cs.skill === skill
               );

               if (existingMapping) return existingMapping;
               if (customSkill) return customSkill;

               return {
                  skill,
                  experienceMappings: allExperienceTitles,
               };
            });

            dispatch(setSkillsMapped(updatedMappings));
            return updatedMappings;
         });
      }
   }, [analysis?.technicalSkills, userDetails]);

   // Move the initialization logic outside useEffect
   const initializeCombinedSkills = () => {
      const customSkillSet = new Set(
         userDetails?.customSkills?.map((cs) => cs.skill) || []
      );

      // Separate generated and custom skills
      const generated =
         analysis?.technicalSkills
            ?.filter((skill) => !customSkillSet.has(skill))
            .map((skill) => ({
               skill,
               experienceMappings:
                  skillMappings.find((m) => m.skill === skill)
                     ?.experienceMappings || [],
               type: "generated",
            })) || [];

      const custom =
         userDetails?.customSkills?.map((skill) => ({
            ...skill,
            type: "custom",
         })) || [];

      return [...generated, ...custom];
   };

   useEffect(() => {
      // Only run this effect if we have necessary data and skillMappings has changed
      if (
         (analysis?.technicalSkills || userDetails?.customSkills) &&
         skillMappings.length > 0
      ) {
         const initialSkills = initializeCombinedSkills();

         // Only update state if the skills have actually changed
         if (JSON.stringify(initialSkills) !== JSON.stringify(combinedSkills)) {
            setCombinedSkills(initialSkills);

            // Dispatch to Redux store
            dispatch({
               type: "skills/setCombinedSkills",
               payload: initialSkills,
            });
         }
      }
   }, [skillMappings, userDetails?.customSkills, analysis?.technicalSkills]);

   const calculateTotalExperience = (experiences) => {
      let totalMonths = 0;

      experiences.forEach((exp) => {
         if (exp.startDate && exp.endDate) {
            const [startYear, startMonth] = exp.startDate
               .split("-")
               .map(Number);
            const [endYear, endMonth] = exp.endDate.split("-").map(Number);

            // Calculate the total months between start and end dates
            const months = (endYear - startYear) * 12 + (endMonth - startMonth);
            const validMonths = Math.max(0, months); // Ensure no negative months
            totalMonths += validMonths;
         }
      });

      // Convert total months to years and round to 1 decimal place
      return (totalMonths / 12).toFixed(1);
   };

   const handleSkillMappingChange = (skill, expTitle, checked, isCustom) => {
      setSkillMappings((prev) => {
         if (isCustom) {
            // Update custom skills in userDetails
            const updatedCustom = userDetails.customSkills.map((cs) =>
               cs.skill === skill
                  ? {
                       ...cs,
                       experienceMappings: checked
                          ? [...cs.experienceMappings, expTitle]
                          : cs.experienceMappings.filter((t) => t !== expTitle),
                    }
                  : cs
            );
            dispatch(
               setUserDetails({ ...userDetails, customSkills: updatedCustom })
            );
            return prev;
         }
         return prev.map((mapping) =>
            mapping.skill === skill
               ? {
                    ...mapping,
                    experienceMappings: checked
                       ? [...new Set([...mapping.experienceMappings, expTitle])]
                       : mapping.experienceMappings.filter(
                            (t) => t !== expTitle
                         ),
                 }
               : mapping
         );
      });
   };

   const handleDropdownToggle = (index) => {
      setOpenDropdown(openDropdown === index ? null : index);
   };

   // Add this helper function to clean up duplicates in the skill mappings
   const removeDuplicateSkillMappings = useCallback(() => {
      setSkillMappings((prevMappings) => {
         const uniqueSkills = {};
         const uniqueMappings = [];

         for (const mapping of prevMappings) {
            const skill = mapping.skill;
            if (!uniqueSkills[skill]) {
               uniqueSkills[skill] = true;
               uniqueMappings.push(mapping);
            }
         }

         // Only update if there's an actual change
         if (uniqueMappings.length !== prevMappings.length) {
            return uniqueMappings;
         }
         return prevMappings;
      });
   }, []);

   // Fix for the handleAddSkill function

   // Complete rewrite of handleAddSkill
   const handleAddSkill = () => {
      console.log("Current combinedSkills:", combinedSkills);

      const newSkill = "";

      // Get all experience titles
      const allExperienceTitles =
         userDetails?.experience?.map((exp) => exp.title) || [];

      // Create new skill object with all experiences mapped
      const newSkillObj = {
         skill: newSkill,
         experienceMappings: allExperienceTitles,
         type: "generated",
      };

      // Update analysis
      const updatedTechnicalSkills = [
         ...(analysis?.technicalSkills || []),
         newSkill,
      ];
      setAnalysis((prev) => ({
         ...prev,
         technicalSkills: updatedTechnicalSkills,
      }));

      // Update combinedSkills
      const updatedCombinedSkills = [...(combinedSkills || []), newSkillObj];
      console.log("Updated combinedSkills:", updatedCombinedSkills);
      setCombinedSkills(updatedCombinedSkills);

      // Update skill mappings - ensure no duplicates
      setSkillMappings((prev) => {
         // Check if a mapping for empty skill already exists
         const emptySkillMapping = prev.find((m) => m.skill === "");
         if (emptySkillMapping) return prev;

         // Add new mapping
         const newMapping = {
            skill: newSkill,
            experienceMappings: allExperienceTitles,
         };
         return [...prev, newMapping];
      });

      // Update Redux store
      dispatch({
         type: "skills/setCombinedSkills",
         payload: updatedCombinedSkills,
      });
      dispatch(setSkills(updatedTechnicalSkills));
   };

   // Complete rewrite of handleSkillChange
   const handleSkillChange = (newSkill, index) => {
      // Store the current skill name before changing it
      const currentSkill = combinedSkills[index]?.skill;

      // Update combinedSkills first
      setCombinedSkills((prev) => {
         const updated = [...prev];
         if (updated[index]) {
            updated[index] = {
               ...updated[index],
               skill: newSkill,
            };
         }
         return updated;
      });

      // Update analysis.technicalSkills
      setAnalysis((prev) => {
         if (!prev) return null;

         const updatedSkills = [...prev.technicalSkills];
         const technicalIndex = updatedSkills.indexOf(currentSkill);
         if (technicalIndex !== -1) {
            updatedSkills[technicalIndex] = newSkill;
         }

         return {
            ...prev,
            technicalSkills: updatedSkills,
         };
      });

      // Update skillMappings - replace the old skill mapping with a new one
      setSkillMappings((prev) => {
         // Find the mapping for the current skill
         const currentMapping = prev.find(
            (mapping) => mapping.skill === currentSkill
         );

         // If no mapping exists, don't modify the array
         if (!currentMapping) return prev;

         // Filter out the old mapping and add updated one
         return [
            ...prev.filter((mapping) => mapping.skill !== currentSkill),
            {
               skill: newSkill,
               experienceMappings: currentMapping.experienceMappings || [],
            },
         ];
      });

      // Update Redux store
      dispatch(
         setSkills((prevSkills) => {
            return prevSkills.map((skill) =>
               skill === currentSkill ? newSkill : skill
            );
         })
      );
   };

   const handleRemoveSkill = (index) => {
      const skillToRemove = combinedSkills[index]?.skill;
      if (!skillToRemove && skillToRemove !== "") return;

      // Remove from combinedSkills
      setCombinedSkills((prev) => prev.filter((_, i) => i !== index));

      // Remove from analysis.technicalSkills
      setAnalysis((prev) => {
         if (!prev) return null;
         return {
            ...prev,
            technicalSkills: prev.technicalSkills.filter(
               (skill) => skill !== skillToRemove
            ),
         };
      });

      // Remove from skillMappings
      setSkillMappings((prev) =>
         prev.filter((mapping) => mapping.skill !== skillToRemove)
      );

      // Update Redux store
      dispatch({
         type: "skills/setCombinedSkills",
         payload: combinedSkills.filter((_, i) => i !== index),
      });
      dispatch(
         setSkills(
            analysis.technicalSkills.filter((skill) => skill !== skillToRemove)
         )
      );
      dispatch(
         setSkillsMapped(
            skillMappings.filter((mapping) => mapping.skill !== skillToRemove)
         )
      );
   };

   //ANALYZE
   const analyzeJobDescription = async () => {
      setIsAnalyzing(true);
      try {
         if (!user?.uid) {
            throw new Error("User not authenticated");
         }

         //checking if quota available or not
         const quota = await QuotaService.getUserQuota();

         const parsingUsed = quota?.parsing?.used ?? 0;
         const parsingLimit = quota?.parsing?.limit ?? 0;

         const hasQuota = parsingUsed < parsingLimit;

         if (!hasQuota) {
            toast.error("parsing quota exceeded. Please upgrade your plan.");

            throw new Error(
               "Parsing quota exceeded. Please upgrade your plan."
            );
         }

         const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
         const API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

         const prompt = `Analyze this job description as a professional resume writer. Return ONLY a JSON object in this exact format, no other text:
            {
               "technicalSkills": [array of strings],
               "yearsOfExperience": number,
               "roleDescriptions": [
                  {
                     "title": string,
                     "organization": string,
                     "description": string
                  }
               ]
            }
   
            Job Description: ${jobDescription}`;

         const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
               {
                  role: "system",
                  content:
                     "You are a professional resume writer. Analyze job descriptions and return information in JSON format. Return ONLY the JSON object, no additional text.",
               },
               {
                  role: "user",
                  content: prompt,
               },
            ],
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: "json_object" },
         });

         const analysisResult = JSON.parse(
            completion.choices[0].message.content || "{}"
         );
         setAnalysis(analysisResult);
         dispatch(setSkills(analysisResult.technicalSkills)); // Instead of dispatch(analysisResult.skills)
         await QuotaService.incrementUsage("parsing");
         console.log(analysisResult, "analysisResultfromANAlyser");
         return analysisResult;
      } catch (error) {
         console.error("Analysis of JD error:", error);
         console.log(error.message);
         toast.error(error.message);
      } finally {
         setIsAnalyzing(false);
      }
   };

   // Add this new handler
   // Modify handleSaveToCustomSkills
   const handleSaveToCustomSkills = async (skill) => {
      // Get current mappings for the skill
      const currentMappings =
         skillMappings.find((m) => m.skill === skill)?.experienceMappings || [];

      // Create new custom skill with current mappings
      const newCustomSkill = {
         skill,
         experienceMappings: currentMappings,
      };

      // Remove from generated skills
      setAnalysis((prev) => ({
         ...prev,
         technicalSkills: prev.technicalSkills.filter((s) => s !== skill),
      }));

      // Update user details
      const updatedUserDetails = {
         ...userDetails,
         customSkills: [...(userDetails.customSkills || []), newCustomSkill],
      };
      await UserDetailsService.saveUserDetails(updatedUserDetails);
      dispatch(setUserDetails(updatedUserDetails));
   };

   // Move consolidateSkills outside useEffect
   const consolidateSkills = useCallback(() => {
      const generatedSkills = analysis?.technicalSkills || [];
      const customSkills = userDetails?.customSkills || [];

      // Combine all skills with their mappings
      const consolidatedMappings = [
         ...generatedSkills.map((skill) => ({
            skill,
            experienceMappings:
               skillMappings.find((m) => m.skill === skill)
                  ?.experienceMappings || [],
         })),
         ...customSkills,
      ];

      dispatch(setSkillsMapped(consolidatedMappings));
      dispatch(setSkills(consolidatedMappings.map((s) => s.skill)));
   }, [
      analysis?.technicalSkills,
      userDetails?.customSkills,
      skillMappings,
      dispatch,
   ]);

   // Add useEffect to run consolidation when analysis or customSkills change
   useEffect(() => {
      // Only run when we have necessary data and avoid unnecessary updates
      const hasSkills =
         analysis?.technicalSkills?.length > 0 ||
         userDetails?.customSkills?.length > 0;

      if (hasSkills && !isAnalyzing) {
         consolidateSkills();
      }
   }, [analysis?.technicalSkills, userDetails?.customSkills, isAnalyzing]);

   // When user modifies mappings
   const handleUpdateMapping = (skillName, expTitle, isChecked) => {
      setCombinedSkills((prev) => {
         const updated = prev.map((skill) => {
            if (skill.skill === skillName) {
               const newMappings = isChecked
                  ? [
                       ...new Set([
                          ...(skill.experienceMappings || []),
                          expTitle,
                       ]),
                    ]
                  : (skill.experienceMappings || []).filter(
                       (exp) => exp !== expTitle
                    );

               return {
                  ...skill,
                  experienceMappings: newMappings,
               };
            }
            return skill;
         });

         // Dispatch a plain object action
         dispatch({
            type: "skills/setCombinedSkills",
            payload: updated,
         });

         return updated;
      });
   };

   const handleDeleteCustomSkill = async (skillToDelete) => {
      // Remove from custom skills
      const updatedUserDetails = {
         ...userDetails,
         customSkills: userDetails.customSkills.filter(
            (skill) => skill.skill !== skillToDelete
         ),
      };

      // Add back to generated skills if it exists in analysis
      if (analysis?.technicalSkills.includes(skillToDelete)) {
         setAnalysis((prev) => ({
            ...prev,
            technicalSkills: [...prev.technicalSkills, skillToDelete],
         }));
      }

      await UserDetailsService.saveUserDetails(updatedUserDetails);
      dispatch(setUserDetails(updatedUserDetails));
   };

   return (
      <Card className="bg-white/60 shadow-lg border-slate-100 backdrop-blur-2xl rounded-xl">
         <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
               Job Description Analyzer
            </CardTitle>
         </CardHeader>
         <CardContent className="p-2 md:p-6 bg-transparent">
            <div className="space-y-4">
               {/* User Guide */}

               <Textarea
                  placeholder="Preferred 8+ years experience in at least one modern web front-end development. Strong proficiency in Typescript and JavaScript, HTML5, and CSS3.... etc"
                  className="min-h-[200px] resize-none p-4 font-sans text-base shadow-lg "
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
               />

               <Button
                  onClick={analyzeJobDescription}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg"
                  disabled={isAnalyzing || !jobDescription.trim()}
               >
                  {isAnalyzing ? (
                     <>
                        <Spinner className="w-4 h-4 border-2 mr-2" />
                        Analyzing...
                     </>
                  ) : (
                     "Analyze Job Description"
                  )}
               </Button>

               {/* Explanation */}
               <p className="text-xs text-gray-600">
                  Clicking "Analyze" will extract key details from the job
                  description, such as required experience and skills.
               </p>
               {analysis && (
                  <div className="p-6 space-y-6 border border-slate-300 rounded-lg bg-white">
                     <div className="border-t border-slate-300">
                        <h3 className="text-xl font-semibold mb-4  mt-4">
                           Technical Skills:
                        </h3>
                        <div className="flex flex-wrap gap-5 justify-start">
                           {combinedSkills.map((skillObj, index) => (
                              <div
                                 key={index}
                                 className={`w-[98%] lg:w-[23%] group relative border ${
                                    skillObj.type === "custom"
                                       ? "border-green-200 bg-green-100/70"
                                       : "border-slate-200 bg-purple-100/70"
                                 } py-2 px-3 rounded-xl`}
                              >
                                 <div className="relative flex items-center gap-1">
                                    <input
                                       type="text"
                                       value={skillObj.skill}
                                       onChange={(e) =>
                                          handleSkillChange(
                                             e.target.value,
                                             index
                                          )
                                       }
                                       className="w-full px-3 py-2 text-sm bg-white text-black font-medium rounded-lg border border-slate-400 focus:border-blue-200 focus:ring-1 focus:ring-blue-300 outline-none transition-all duration-200 hover:bg-teal-50"
                                       placeholder="Enter skill"
                                       title="Edit Skill"
                                    />
                                    {skillObj.type === "generated" && (
                                       <button
                                          onClick={() =>
                                             handleSaveToCustomSkills(
                                                skillObj.skill
                                             )
                                          }
                                          title="Save to Custom Skills"
                                          className="p-2 bg-white text-green-400 rounded-lg border border-green-600 hover:bg-green-100 transition-all duration-200"
                                       >
                                          <PlusCircle size={16} />
                                       </button>
                                    )}
                                    <button
                                       onClick={() =>
                                          skillObj.type === "custom"
                                             ? handleDeleteCustomSkill(
                                                  skillObj.skill
                                               )
                                             : handleRemoveSkill(index)
                                       }
                                       title="Remove Skill"
                                       className="p-2 bg-white text-rose-400 rounded-lg border border-red-600 hover:bg-red-200 transition-all duration-200"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                    <button
                                       data-index={index}
                                       onClick={() =>
                                          handleDropdownToggle(index)
                                       }
                                       title="Map Skill to Experience"
                                       className={`p-2 bg-white text-blue-400 rounded-lg border border-blue-600 hover:bg-blue-100 transition-all duration-200 ${
                                          openDropdown === index
                                             ? "bg-blue-600 text-orange-400"
                                             : ""
                                       }`}
                                    >
                                       <MapIcon size={16} />
                                    </button>
                                    {openDropdown === index && (
                                       <div
                                          ref={dropdownRef}
                                          className="absolute z-[9999] bg-slate-800 text-white rounded-lg shadow-lg p-4 border border-slate-700 space-y-2"
                                       >
                                          <h4 className="font-bold text-sm mb-2">
                                             Map Skill to:
                                          </h4>
                                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                             {userDetails.experience.map(
                                                (exp, i) => {
                                                   const isTitleBased =
                                                      exp.responsibilityType ===
                                                      "titleBased";
                                                   const inputId = `mapping-${index}-${i}`;

                                                   return (
                                                      <div
                                                         key={i}
                                                         className={`flex items-center gap-2 ${
                                                            isTitleBased
                                                               ? "opacity-50"
                                                               : ""
                                                         }`}
                                                      >
                                                         <input
                                                            id={inputId} // 👈 give the input an ID
                                                            type="checkbox"
                                                            checked={
                                                               skillObj.type ===
                                                               "custom"
                                                                  ? userDetails.customSkills
                                                                       .find(
                                                                          (
                                                                             cs
                                                                          ) =>
                                                                             cs.skill ===
                                                                             skillObj.skill
                                                                       )
                                                                       ?.experienceMappings?.includes(
                                                                          exp.title
                                                                       )
                                                                  : skillMappings
                                                                       .find(
                                                                          (m) =>
                                                                             m.skill ===
                                                                             skillObj.skill
                                                                       )
                                                                       ?.experienceMappings?.includes(
                                                                          exp.title
                                                                       )
                                                            }
                                                            onChange={(e) =>
                                                               handleSkillMappingChange(
                                                                  skillObj.skill,
                                                                  exp.title,
                                                                  e.target
                                                                     .checked,
                                                                  skillObj.type ===
                                                                     "custom"
                                                               )
                                                            }
                                                         />
                                                         <label
                                                            htmlFor={inputId} // 👈 match it here
                                                            className={`text-sm ${
                                                               isTitleBased
                                                                  ? "cursor-not-allowed"
                                                                  : "cursor-pointer"
                                                            }`}
                                                         >
                                                            {exp.title}
                                                            {isTitleBased && (
                                                               <span className="ml-1 text-slate-400">
                                                                  (Title-based)
                                                               </span>
                                                            )}
                                                         </label>
                                                      </div>
                                                   );
                                                }
                                             )}
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div>
                        {" "}
                        <button
                           onClick={handleAddSkill}
                           className="flex items-center gap-2 mt-6 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg mb-4"
                        >
                           <PlusCircle size={16} />
                           Add New Skill
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
