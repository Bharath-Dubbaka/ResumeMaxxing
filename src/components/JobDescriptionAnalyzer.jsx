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

const genAI = new GoogleGenerativeAI(
   process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
);

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
         setSkillMappings((prev) => {
            const allExperienceTitles = userDetails.experience.map(
               (exp) => exp.title
            );

            // Create mappings for any new skills while preserving existing mappings
            return analysis.technicalSkills.map((skill) => {
               const existingMapping = prev.find((m) => m.skill === skill);
               return (
                  existingMapping || {
                     skill,
                     experienceMappings: allExperienceTitles,
                  }
               );
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

         const prompt = `Analyze this job description as a professional resume writer. Respond ONLY with a JSON object in this exact format, no other text:
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

         const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               contents: [
                  {
                     parts: [
                        {
                           text: prompt,
                        },
                     ],
                  },
               ],
            }),
         });

         if (!response.ok) {
            throw new Error("Failed to analyze job description");
         }

         const data = await response.json();
         const content = data.candidates[0].content.parts[0].text;

         // Extract JSON using regex
         const jsonMatch = content.match(/\{[\s\S]*\}/);
         if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
         }

         const analysisResult = JSON.parse(jsonMatch[0]);
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

   return (
      <Card className="bg-white/60 shadow-lg border-slate-100 backdrop-blur-2xl rounded-xl">
         <Toaster position="top-center" />
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
                           {analysis.technicalSkills?.map((skill, index) => (
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
                                          className="w-full absolute top-12 left-0 z-10 bg-slate-800 text-white rounded-lg shadow-lg p-4 border border-slate-700 space-y-2"
                                       >
                                          <h4 className="font-bold text-sm mb-2">
                                             Map Skill to:
                                          </h4>
                                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                             {userDetails.experience.map(
                                                (exp, i) => (
                                                   <div
                                                      key={i}
                                                      className="flex items-center gap-2"
                                                   >
                                                      <input
                                                         type="checkbox"
                                                         id={`mapping-${index}-${i}`}
                                                         checked={skillMappings[
                                                            index
                                                         ]?.experienceMappings.includes(
                                                            exp.title
                                                         )}
                                                         onChange={(e) =>
                                                            handleSkillMappingChange(
                                                               skill,
                                                               exp.title,
                                                               e.target.checked
                                                            )
                                                         }
                                                      />
                                                      <label
                                                         htmlFor={`mapping-${index}-${i}`}
                                                         className="text-sm"
                                                      >
                                                         {exp.title}
                                                      </label>
                                                   </div>
                                                )
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

                                 {/* {openDropdown === index && (
                              <div
                                 className="absolute left-0 top-[calc(100%+4px)] w-full bg-slate-800 rounded-xl p-3 shadow-xl border border-slate-600 z-20"
                                 ref={dropdownRef}
                              >
                                 {userDetails.experience.map(
                                    (exp, expIndex) => {
                                       const isSelected = skillMappings
                                          .find((m) => m.skill === skill)
                                          ?.experienceMappings.includes(
                                             exp.title
                                          );
                                       const isTitleBased =
                                          exp.responsibilityType ===
                                          "titleBased";

                                       return (
                                          <label
                                             key={expIndex}
                                             className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                                                isTitleBased
                                                   ? "opacity-50 cursor-not-allowed bg-slate-700"
                                                   : "hover:bg-slate-700"
                                             } transition-all duration-200`}
                                          >
                                             <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isTitleBased}
                                                onChange={(e) =>
                                                   handleSkillMappingChange(
                                                      skill,
                                                      exp.title,
                                                      e.target.checked
                                                   )
                                                }
                                                className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
                                             />
                                             <span className="text-xs text-slate-200">
                                                {exp.title}
                                                {isTitleBased && (
                                                   <span className="ml-1 text-slate-400">
                                                      (Title-based)
                                                   </span>
                                                )}
                                             </span>
                                          </label>
                                       );
                                    }
                                 )}
                              </div>
                           )} */}
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
