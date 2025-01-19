// const handleDropdownToggle = (index: number) => {
//     setOpenDropdown(openDropdown === index ? null : index);
//  };



//  const handleAddSkill = (type: "technical" | "soft") => {
//     setAnalysisResult((prev) => {
//        if (!prev) return null;
//        const updatedSkills = [
//           ...prev[type === "technical" ? "technicalSkills" : "softSkills"],
//           "",
//        ];

//        // Add default mapping for the new skill
//        const allExperienceTitles = userDetails.experience.map(
//           (exp) => exp.title
//        );
//        const updatedMappings = [...skillMappings];
//        updatedMappings.push({
//           skill: "",
//           experienceMappings: allExperienceTitles,
//        });
//        setSkillMappings(updatedMappings);

//        return {
//           ...prev,
//           [type === "technical" ? "technicalSkills" : "softSkills"]:
//              updatedSkills,
//        };
//     });
//  };

//  const handleRemoveSkill = (index: number, type: "technical" | "soft") => {
//     setAnalysisResult((prev) => {
//        if (!prev) return null;
//        const updatedSkills = prev[
//           type === "technical" ? "technicalSkills" : "softSkills"
//        ].filter((_, i) => i !== index);

//        // Remove mapping for the deleted skill
//        const skillToRemove =
//           prev[type === "technical" ? "technicalSkills" : "softSkills"][
//              index
//           ];
//        const updatedMappings = skillMappings.filter(
//           (m) => m.skill !== skillToRemove
//        );
//        setSkillMappings(updatedMappings);

//        return {
//           ...prev,
//           [type === "technical" ? "technicalSkills" : "softSkills"]:
//              updatedSkills,
//        };
//     });
//  };

//  const handleSkillChange = (
//     value: string,
//     index: number,
//     type: "technical" | "soft"
//  ) => {
//     setAnalysisResult((prev) => {
//        if (!prev) return null;
//        const updatedSkills = [
//           ...prev[type === "technical" ? "technicalSkills" : "softSkills"],
//        ];
//        const oldSkill = updatedSkills[index];
//        updatedSkills[index] = value;

//        // Find existing mapping for this skill
//        const mappingIndex = skillMappings.findIndex(
//           (m) => m.skill === oldSkill
//        );
//        const updatedMappings = [...skillMappings];

//        if (mappingIndex !== -1) {
//           // Update only the skill name, preserve its mappings
//           updatedMappings[mappingIndex] = {
//              ...updatedMappings[mappingIndex],
//              skill: value,
//           };
//        } else {
//           // If no mapping exists, create new with all experiences
//           const allExperienceTitles = userDetails.experience.map(
//              (exp) => exp.title
//           );
//           updatedMappings.push({
//              skill: value,
//              experienceMappings: allExperienceTitles,
//           });
//        }

//        setSkillMappings(updatedMappings);

//        return {
//           ...prev,
//           [type === "technical" ? "technicalSkills" : "softSkills"]:
//              updatedSkills,
//        };
//     });
//  };

 
//  const handleSkillMappingChange = (
//     skill: string,
//     expTitle: string,
//     checked: boolean
//  ) => {
//     setSkillMappings((prev) =>
//        prev.map((mapping) =>
//           mapping.skill === skill
//              ? {
//                   ...mapping,
//                   experienceMappings: checked
//                      ? [...mapping.experienceMappings, expTitle]
//                      : mapping.experienceMappings.filter(
//                           (title) => title !== expTitle
//                        ),
//                }
//              : mapping
//        )
//     );
//  };


{/* Technical Skills */}
{/* <div className="bg-gradient-to-l from-slate-800/50 to-slate-900/60 rounded-xl p-6 shadow-lg border border-slate-600/20">
<div className="relative mb-6">
   <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-flex items-center gap-2">
      Technical Skills:
      <span className="text-xs text-slate-400 font-normal bg-slate-800 px-2 py-1 rounded-lg">
         Editable
      </span>
   </h3>
</div>

<div className="flex flex-wrap gap-4">
   {analysisResult.technicalSkills.map((skill, index) => (
      <div key={index} className="w-[23%] group relative">
         <div className="relative flex items-center gap-1">
            <input
               type="text"
               value={skill}
               onChange={(e) =>
                  handleSkillChange(
                     e.target.value,
                     index,
                     "technical"
                  )
               }
               className="w-full px-3 py-2 text-sm bg-slate-600 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
               placeholder="Enter skill"
               title="Edit Skill"
            />
            <button
               onClick={() => {
                  handleDropdownToggle(index);
               }}
               title="Map Skill to Experience"
               className={`p-2 bg-slate-800 text-blue-400 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200 ${
                  openDropdown === index
                     ? "bg-blue-600 text-orange-400"
                     : ""
               }`}
            >
               <MapIcon size={16} />
            </button>
            <button
               onClick={() =>
                  handleRemoveSkill(index, "technical")
               }
               title="Remove Skill"
               className="p-2 bg-slate-800 text-rose-400 rounded-lg border border-slate-600 hover:bg-slate-700 transition-all duration-200"
            >
               <Trash2 size={16} />
            </button>
         </div>

         {openDropdown === index && (
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
         )}
      </div>
   ))}
</div>

<button
   onClick={() => handleAddSkill("technical")}
   className="flex items-center gap-2 mt-6 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg mb-4"
>
   <PlusCircle size={16} />
   Add Skill
</button>
</div>  */}
