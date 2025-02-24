"use client";
import { useState, useEffect, useRef } from "react";
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
            ...(userDetails.customSkills?.map(cs => cs.skill) || [])
         ];

         setSkillMappings((prev) => {
            const allExperienceTitles = userDetails.experience.map(
               (exp) => exp.title
            );

            // Create mappings for all skills while preserving existing mappings
            return allSkills.map((skill) => {
               const existingMapping = prev.find((m) => m.skill === skill);
               // If it's a custom skill, use its existing mappings
               const customSkill = userDetails.customSkills?.find(cs => cs.skill === skill);
               return existingMapping || customSkill || {
                  skill,
                  experienceMappings: allExperienceTitles,
               };
            });
         });
         dispatch(setSkillsMapped(skillMappings));
      }
   }, [analysis?.technicalSkills, userDetails]);

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

   const handleSkillMappingChange = (skill, expTitle, checked) => {
      console.log("Skill Mapping Change:", { skill, expTitle, checked });
      let updatedMappings;
      setSkillMappings((prev) => {
         updatedMappings = prev.map((mapping) =>
            mapping.skill === skill
               ? {
                    ...mapping,
                    experienceMappings: checked
                       ? [...mapping.experienceMappings, expTitle]
                       : mapping.experienceMappings.filter(
                            (title) => title !== expTitle
                         ),
                 }
               : mapping
         );
         dispatch(setSkillsMapped(updatedMappings));

         console.log("Updated Skill Mappings:", updatedMappings);
         return updatedMappings;
      });

      dispatch(setSkillsMapped(skillMappings));
   };

   const handleDropdownToggle = (index) => {
      setOpenDropdown(openDropdown === index ? null : index);
   };

   //Skill ADD EDIT AND DELETE BELOW
   const handleAddSkill = () => {
      console.log("Adding new skill...");

      setAnalysis((prev) => {
         if (!prev) return null;

         const updatedSkills = [...prev.technicalSkills, ""];
         console.log("Updated Skills Array:", updatedSkills);

         // Update skill mappings
         const allExperienceTitles =
            userDetails?.experience?.map((exp) => exp.title) || [];

         setSkillMappings((prevMappings) => {
            const updatedMappings = [
               ...prevMappings,
               {
                  skill: "",
                  experienceMappings: allExperienceTitles,
               },
            ];
            console.log("Updated Skill Mappings:", updatedMappings);
            return updatedMappings;
         });

         return {
            ...prev,
            technicalSkills: updatedSkills,
         };
      });
   };

   const handleSkillChange = (newSkill, index) => {
      console.log("Changing skill:", { newSkill, index });

      setAnalysis((prev) => {
         if (!prev) return null;

         const updatedSkills = [...prev.technicalSkills];
         updatedSkills[index] = newSkill;

         // Update skill mappings with new skill name
         setSkillMappings((prevMappings) => {
            const updatedMappings = prevMappings.map((mapping, i) =>
               i === index ? { ...mapping, skill: newSkill } : mapping
            );
            console.log("Updated Skill Mappings:", updatedMappings);
            return updatedMappings;
         });

         console.log("Updated Skills Array:", updatedSkills);
         return {
            ...prev,
            technicalSkills: updatedSkills,
         };
      });
   };

   const handleRemoveSkill = (index) => {
      console.log("Removing skill at index:", index);

      setAnalysis((prev) => {
         if (!prev) return null;

         const updatedSkills = prev.technicalSkills.filter(
            (_, i) => i !== index
         );
         console.log("Updated Skills Array:", updatedSkills);

         // Remove corresponding skill mapping
         setSkillMappings((prevMappings) => {
            const updatedMappings = prevMappings.filter((_, i) => i !== index);
            console.log("Updated Skill Mappings:", updatedMappings);
            return updatedMappings;
         });

         return {
            ...prev,
            technicalSkills: updatedSkills,
         };
      });
   };

   //ANALYZE
   const analyzeJobDescription = async () => {
      setIsAnalyzing(true);
      try {
         if (!user?.uid) {
            throw new Error("User not authenticated");
         }

         const hasQuota = await QuotaService.checkQuota(user.uid, "parsing");
         if (!hasQuota) {
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
         await QuotaService.incrementUsage(user.uid, "parsing");
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
   const handleSaveToCustomSkills = async (skill) => {
      try {
         if (!user?.uid || !userDetails) {
            console.log("Please login to save custom skills");
            return;
         }

         // Check if skill already exists in custom skills
         const skillExists = userDetails.customSkills?.some(cs => cs.skill === skill);
         if (skillExists) {
            toast.error("This skill is already in your custom skills!");
            return;
         }

         // Create new custom skill
         const newCustomSkill = {
            skill: skill,
            experienceMappings: userDetails.experience?.map(exp => exp.title) || []
         };

         // Create updated user details
         const updatedUserDetails = {
            ...userDetails,
            customSkills: [...(userDetails.customSkills || []), newCustomSkill]
         };

         // Save to Firestore using UserDetailsService
         await UserDetailsService.saveUserDetails(user.uid, updatedUserDetails);
         
         // Update Redux store
         dispatch(setUserDetails(updatedUserDetails));

         toast.success("Skill added to custom skills!");
      } catch (error) {
         console.error("Error saving custom skill:", error);
         toast.error("Failed to save skill. Please try again.");
      }
   };

   // Add this function after the existing state declarations
   const consolidateSkills = () => {
      const generatedSkills = analysis?.technicalSkills || [];
      const customSkills = userDetails?.customSkills || [];
      
      // Combine all skills with their mappings
      const consolidatedMappings = [
        ...generatedSkills.map(skill => ({
          skill,
          experienceMappings: skillMappings.find(m => m.skill === skill)?.experienceMappings || []
        })),
        ...customSkills
      ];

      // Update Redux store with consolidated skills
      dispatch(setSkillsMapped(consolidatedMappings));
      dispatch(setSkills(consolidatedMappings.map(s => s.skill)));
   };

   // Add useEffect to run consolidation when analysis or customSkills change
   useEffect(() => {
      if (analysis?.technicalSkills || userDetails?.customSkills) {
         consolidateSkills();
      }
   }, [analysis?.technicalSkills, userDetails?.customSkills]);

   return (
      <Card className="bg-white/60 shadow-lg border-slate-100 backdrop-blur-2xl rounded-xl">
         <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
               Job Description Analyzer
            </CardTitle>
         </CardHeader>
         <CardContent className="p-6 bg-transparent">
            <div className="space-y-4">
               <Textarea
                  placeholder="Paste your job description here..."
                  className="min-h-[200px] resize-none p-4 font-sans text-base"
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

               {analysis && (
                  <div className="p-6 space-y-6 border border-slate-300 rounded-lg bg-white">
                     <div className="flex justify-between w-full ">
                        <div className="min-w-[49%] border border-slate-200 p-4 rounded-lg bg-purple-50">
                           <h5 className="flex font-semibold">
                              Experience Required:{" "}
                              <p className="text-gray-700">
                                 {analysis.yearsOfExperience} years
                              </p>
                           </h5>
                        </div>
                        <div className="min-w-[49%] border border-slate-200 p-4 rounded-lg bg-purple-50">
                           <h5 className="flex font-semibold">
                              Your Total Experience:{" "}
                              <p className="text-gray-700">
                                 {userDetails?.experience
                                    ? calculateTotalExperience(
                                         userDetails.experience
                                      )
                                    : 0}{" "}
                                 years
                              </p>
                           </h5>
                        </div>
                     </div>

                     <div className="border-t border-slate-300">
                        <h3 className="text-xl font-semibold mb-4  mt-4">
                           Technical Skills:
                        </h3>
                        <div className="flex flex-wrap gap-5 justify-start">
                           {[
                              ...(analysis.technicalSkills || []),
                              ...(userDetails?.customSkills?.map(cs => cs.skill) || [])
                           ].map((skill, index) => (
                              <div
                                 key={index}
                                 className="w-[23%] group relative border border-slate-200 py-2 px-3 bg-purple-50 rounded-xl"
                              >
                                 <div className="relative flex items-center gap-1">
                                    <input
                                       type="text"
                                       value={skill}
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
                                    {/* Add Save to Custom Skills button for generated skills */}
                                    {analysis.technicalSkills.includes(skill) && (
                                       <button
                                          onClick={() => handleSaveToCustomSkills(skill)}
                                          title="Save to Custom Skills"
                                          className="p-2 bg-white text-green-400 rounded-lg border border-green-600 hover:bg-green-100 transition-all duration-200"
                                       >
                                          <PlusCircle size={16} />
                                       </button>
                                    )}
                                    <button
                                       onClick={() => {
                                          handleDropdownToggle(index);
                                       }}
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
                                          className="w-full z-50 absolute top-12 left-0 bg-slate-800 text-white rounded-lg shadow-lg p-4 border border-slate-700 space-y-2"
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
                                                            type="checkbox"
                                                            id={`mapping-${index}-${i}`}
                                                            checked={skillMappings[
                                                               index
                                                            ]?.experienceMappings.includes(
                                                               exp.title
                                                            )}
                                                            disabled={
                                                               isTitleBased
                                                            }
                                                            onChange={(e) =>
                                                               handleSkillMappingChange(
                                                                  skill,
                                                                  exp.title,
                                                                  e.target
                                                                     .checked
                                                               )
                                                            }
                                                            className={`rounded border-slate-500 text-blue-500 focus:ring-blue-500 ${
                                                               isTitleBased
                                                                  ? "cursor-not-allowed"
                                                                  : ""
                                                            }`}
                                                         />
                                                         <label
                                                            htmlFor={`mapping-${index}-${i}`}
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
                                    {/* DELETEBTN */}
                                    <button
                                       onClick={() => handleRemoveSkill(index)}
                                       title="Remove Skill"
                                       className="p-2 bg-white text-rose-400 rounded-lg border border-red-600 hover:bg-red-200 transition-all duration-200"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* <div>
                        <h3 className="text-lg font-semibold mb-3">
                           Soft Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {analysis.softSkills.map((skill, index) => (
                              <span
                                 key={index}
                                 className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                 {skill}
                              </span>
                           ))}
                        </div>
                     </div> */}
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

                     {/* {analysis.roleDescriptions?.length > 0 && (
                        <div>
                           <h3 className="text-lg font-semibold mb-3">
                              Tailored Role Descriptions
                           </h3>
                           <div className="space-y-4">
                              {analysis.roleDescriptions.map((role, index) => (
                                 <div
                                    key={index}
                                    className="p-4 bg-gray-50 rounded-lg"
                                 >
                                    <h4 className="font-medium text-gray-900">
                                       {role.title} at {role.organization}
                                    </h4>
                                    <p className="mt-2 text-gray-600">
                                       {role.description}
                                    </p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )} */}
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
