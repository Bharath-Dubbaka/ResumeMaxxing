// "use client";
// import { useState, useRef } from "react";
// import { Button } from "../components/ui/button";
// import {
//    Card,
//    CardContent,
//    CardHeader,
//    CardTitle,
// } from "../components/ui/card";
// import { Spinner } from "../components/ui/spinner";
// import { Textarea } from "../components/ui/textarea";
// import { useSelector } from "react-redux";
// import { QuotaService } from "../services/QuotaService";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { JsonParser } from "jsonparse";
// import { PlusCircle, MapIcon, Trash2 } from "lucide-react";

// const genAI = new GoogleGenerativeAI(
//    process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
// );

// export default function JobDescriptionAnalyzer() {
//    const { user } = useSelector((state) => state.auth);
//    const { userDetails } = useSelector((state) => state.firebase);
//    const [jobDescription, setJobDescription] = useState("");
//    const [isAnalyzing, setIsAnalyzing] = useState(false);
//    const [analysis, setAnalysis] = useState(null);
//    const [openDropdown, setOpenDropdown] = useState(null);
//    const [skillMappings, setSkillMappings] = useState([]);
//    const dropdownRef = useRef(null);
//    console.log(skillMappings, "skillMappings");
//    const handleDropdownToggle = (index) => {
//       setOpenDropdown(openDropdown === index ? null : index);
//    };

//    const handleAddSkill = (type) => {
//       setAnalysis((prev) => {
//          if (!prev) return null;
//          const updatedSkills = [
//             ...prev[type === "technical" ? "technicalSkills" : "softSkills"],
//             "",
//          ];

//          const allExperienceTitles = userDetails.experience.map(
//             (exp) => exp.title
//          );
//          const updatedMappings = [...skillMappings];
//          updatedMappings.push({
//             skill: "",
//             experienceMappings: allExperienceTitles,
//          });
//          setSkillMappings(updatedMappings);

//          return {
//             ...prev,
//             [type === "technical" ? "technicalSkills" : "softSkills"]:
//                updatedSkills,
//          };
//       });
//    };

//    const handleRemoveSkill = (index, type) => {
//       setAnalysis((prev) => {
//          if (!prev) return null;
//          const updatedSkills = prev[
//             type === "technical" ? "technicalSkills" : "softSkills"
//          ].filter((_, i) => i !== index);

//          const skillToRemove =
//             prev[type === "technical" ? "technicalSkills" : "softSkills"][
//                index
//             ];
//          const updatedMappings = skillMappings.filter(
//             (m) => m.skill !== skillToRemove
//          );
//          setSkillMappings(updatedMappings);

//          return {
//             ...prev,
//             [type === "technical" ? "technicalSkills" : "softSkills"]:
//                updatedSkills,
//          };
//       });
//    };

//    const handleSkillChange = (value, index, type) => {
//       setAnalysis((prev) => {
//          if (!prev) return null;
//          const updatedSkills = [
//             ...prev[type === "technical" ? "technicalSkills" : "softSkills"],
//          ];
//          const oldSkill = updatedSkills[index];
//          updatedSkills[index] = value;

//          const mappingIndex = skillMappings.findIndex(
//             (m) => m.skill === oldSkill
//          );
//          const updatedMappings = [...skillMappings];

//          if (mappingIndex !== -1) {
//             updatedMappings[mappingIndex] = {
//                ...updatedMappings[mappingIndex],
//                skill: value,
//             };
//          } else {
//             const allExperienceTitles = userDetails.experience.map(
//                (exp) => exp.title
//             );
//             updatedMappings.push({
//                skill: value,
//                experienceMappings: allExperienceTitles,
//             });
//          }

//          setSkillMappings(updatedMappings);

//          return {
//             ...prev,
//             [type === "technical" ? "technicalSkills" : "softSkills"]:
//                updatedSkills,
//          };
//       });
//    };

//    const handleSkillMappingChange = (skill, expTitle, checked) => {
//       setSkillMappings((prev) =>
//          prev.map((mapping) =>
//             mapping.skill === skill
//                ? {
//                     ...mapping,
//                     experienceMappings: checked
//                        ? [...mapping.experienceMappings, expTitle]
//                        : mapping.experienceMappings.filter(
//                             (title) => title !== expTitle
//                          ),
//                  }
//                : mapping
//          )
//       );
//    };

//    const analyzeJobDescription = async () => {
//       setIsAnalyzing(true);
//       try {
//          if (!user?.uid) {
//             throw new Error("User not authenticated");
//          }

//          const hasQuota = await QuotaService.checkQuota(user.uid, "parsing");
//          if (!hasQuota) {
//             throw new Error(
//                "Parsing quota exceeded. Please upgrade your plan."
//             );
//          }

//          const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
//          const API_URL =
//             "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

//          const prompt = `Analyze this job description as a professional resume writer. Respond ONLY with a JSON object in this exact format, no other text:
//          {
//             "technicalSkills": [array of strings],
//             "yearsOfExperience": number,
//             "softSkills": [array of strings],
//             "roleDescriptions": [
//                {
//                   "title": string,
//                   "organization": string,
//                   "description": string
//                }
//             ]
//          }

//          Job Description: ${jobDescription}`;

//          const response = await fetch(`${API_URL}?key=${API_KEY}`, {
//             method: "POST",
//             headers: {
//                "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                contents: [
//                   {
//                      parts: [
//                         {
//                            text: prompt,
//                         },
//                      ],
//                   },
//                ],
//             }),
//          });

//          if (!response.ok) {
//             throw new Error("Failed to analyze job description");
//          }

//          const data = await response.json();
//          const content = data.candidates[0].content.parts[0].text;

//          // Extract JSON using regex
//          const jsonMatch = content.match(/\{[\s\S]*\}/);
//          if (!jsonMatch) {
//             throw new Error("No valid JSON found in response");
//          }

//          const analysisResult = JSON.parse(jsonMatch[0]);
//          setAnalysis(analysisResult);

//          await QuotaService.incrementUsage(user.uid, "parsing");
//          return analysisResult;
//       } catch (error) {
//          console.error("Analysis of JD error:", error);
//          alert(error.message);
//       } finally {
//          setIsAnalyzing(false);
//       }
//    };

//    return (
//       <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl">
//          <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
//             <CardTitle className="text-xl font-semibold text-gray-800">
//                Job Description Analyzer
//             </CardTitle>
//          </CardHeader>
//          <CardContent className="p-6">
//             <div className="space-y-4">
//                <Textarea
//                   placeholder="Paste your job description here..."
//                   className="min-h-[200px] resize-none"
//                   value={jobDescription}
//                   onChange={(e) => setJobDescription(e.target.value)}
//                />
//                <Button
//                   onClick={analyzeJobDescription}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
//                   disabled={isAnalyzing || !jobDescription.trim()}
//                >
//                   {isAnalyzing ? (
//                      <>
//                         <Spinner className="w-4 h-4 border-2 mr-2" />
//                         Analyzing...
//                      </>
//                   ) : (
//                      "Analyze Job Description"
//                   )}
//                </Button>

//                {/* Analysis Result EDITABLE AND MAPPABLE */}
//                {analysis && (
//                   <div className="mt-6 space-y-6">
//                      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-600/20">
//                         <div className="relative mb-6">
//                            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-flex items-center gap-2">
//                               Technical Skills:
//                               <span className="text-xs text-slate-400 font-normal bg-slate-800 px-2 py-1 rounded-lg">
//                                  Editable
//                               </span>
//                            </h3>
//                         </div>

//                         <div className="flex flex-wrap gap-4">
//                            {analysis.technicalSkills.map((skill, index) => (
//                               <div
//                                  key={index}
//                                  className="w-[23%] group relative"
//                               >
//                                  <div className="relative flex items-center gap-1">
//                                     <input
//                                        type="text"
//                                        value={skill}
//                                        onChange={(e) =>
//                                           handleSkillChange(
//                                              e.target.value,
//                                              index,
//                                              "technical"
//                                           )
//                                        }
//                                        className="w-full px-3 py-2 text-sm bg-slate-600 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
//                                        placeholder="Enter skill"
//                                        title="Edit Skill"
//                                     />
//                                     <button
//                                        onClick={() =>
//                                           handleDropdownToggle(index)
//                                        }
//                                        title="Map Skill to Experience"
//                                        className={`p-2 bg-slate-800 text-blue-400 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200 ${
//                                           openDropdown === index
//                                              ? "bg-blue-600 text-orange-400"
//                                              : ""
//                                        }`}
//                                     >
//                                        <MapIcon size={16} />
//                                     </button>
//                                     <button
//                                        onClick={() =>
//                                           handleRemoveSkill(index, "technical")
//                                        }
//                                        title="Remove Skill"
//                                        className="p-2 bg-slate-800 text-rose-400 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200"
//                                     >
//                                        <Trash2 size={16} />
//                                     </button>
//                                  </div>

//                                  {openDropdown === index && (
//                                     <div
//                                        className="absolute left-0 top-[calc(100%+4px)] w-full bg-slate-800 rounded-xl p-3 shadow-xl border border-slate-600 z-20"
//                                        ref={dropdownRef}
//                                     >
//                                        {userDetails.experience.map(
//                                           (exp, expIndex) => {
//                                              const isSelected = skillMappings
//                                                 .find((m) => m.skill === skill)
//                                                 ?.experienceMappings.includes(
//                                                    exp.title
//                                                 );
//                                              const isTitleBased =
//                                                 exp.responsibilityType ===
//                                                 "titleBased";

//                                              return (
//                                                 <label
//                                                    key={expIndex}
//                                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
//                                                       isTitleBased
//                                                          ? "opacity-50 cursor-not-allowed bg-slate-700"
//                                                          : "hover:bg-slate-700"
//                                                    } transition-all duration-200`}
//                                                 >
//                                                    <input
//                                                       type="checkbox"
//                                                       checked={isSelected}
//                                                       disabled={isTitleBased}
//                                                       onChange={(e) =>
//                                                          handleSkillMappingChange(
//                                                             skill,
//                                                             exp.title,
//                                                             e.target.checked
//                                                          )
//                                                       }
//                                                       className="rounded border-slate-500 text-blue-500 focus:ring-blue-500"
//                                                    />
//                                                    <span className="text-xs text-slate-200">
//                                                       {exp.title}
//                                                       {isTitleBased && (
//                                                          <span className="ml-1 text-slate-400">
//                                                             (Title-based)
//                                                          </span>
//                                                       )}
//                                                    </span>
//                                                 </label>
//                                              );
//                                           }
//                                        )}
//                                     </div>
//                                  )}
//                               </div>
//                            ))}
//                         </div>

//                         <button
//                            onClick={() => handleAddSkill("technical")}
//                            className="flex items-center gap-2 mt-6 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg mb-4"
//                         >
//                            <PlusCircle size={16} />
//                            Add Skill
//                         </button>
//                      </div>

//                      <div>
//                         <h3 className="text-lg font-semibold mb-3">
//                            Soft Skills
//                         </h3>
//                         <div className="flex flex-wrap gap-2">
//                            {analysis.softSkills.map((skill, index) => (
//                               <span
//                                  key={index}
//                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
//                               >
//                                  {skill}
//                               </span>
//                            ))}
//                         </div>
//                      </div>

//                      <div>
//                         <h3 className="text-lg font-semibold mb-3">
//                            Experience Required
//                         </h3>
//                         <p className="text-gray-700">
//                            {analysis.yearsOfExperience} years
//                         </p>
//                      </div>

//                      {analysis.roleDescriptions?.length > 0 && (
//                         <div>
//                            <h3 className="text-lg font-semibold mb-3">
//                               Tailored Role Descriptions
//                            </h3>
//                            <div className="space-y-4">
//                               {analysis.roleDescriptions.map((role, index) => (
//                                  <div
//                                     key={index}
//                                     className="p-4 bg-gray-50 rounded-lg"
//                                  >
//                                     <h4 className="font-medium text-gray-900">
//                                        {role.title} at {role.organization}
//                                     </h4>
//                                     <p className="mt-2 text-gray-600">
//                                        {role.description}
//                                     </p>
//                                  </div>
//                               ))}
//                            </div>
//                         </div>
//                      )}
//                   </div>
//                )}
//             </div>
//          </CardContent>
//       </Card>
//    );
// }
