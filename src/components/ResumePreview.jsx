import React, { useState, useEffect } from "react";
import { Download, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

const cleanJsonResponse = (response) => {
   try {
      const jsonMatch = response.match(/{[\s\S]*}/);
      if (jsonMatch) {
         const cleanedJson = jsonMatch[0];
         return JSON.stringify(JSON.parse(cleanedJson));
      } else {
         throw new Error("No valid JSON found in the response.");
      }
   } catch (error) {
      console.error("Error cleaning JSON response:", error);
      throw new Error("Failed to parse JSON from response.");
   }
};

const ResumePreview = ({
   initialResumeContent,
   onUpdate,
   //    generateResume,
   downloadAsWord,
   refresh,
   loading,
   onSaveCustomResponsibility,
   userDetails,
}) => {
   const [isEditing, setIsEditing] = useState(false);
   const [resumeData, setResumeData] = useState(null);
   const [addedToCustom, setAddedToCustom] = useState(null);

   useEffect(() => {
      if (initialResumeContent) {
         setResumeData(
            typeof initialResumeContent === "string"
               ? JSON.parse(initialResumeContent)
               : initialResumeContent
         );
      }
   }, [initialResumeContent, refresh]);

   const handleEdit = (field, value) => {
      const updatedData = {
         ...resumeData,
         [field]: value,
      };
      setResumeData(updatedData);
      onUpdate(updatedData);
   };

   const handleExperienceEdit = (expIndex, field, value) => {
      const updatedExperience = [...resumeData.professionalExperience];
      updatedExperience[expIndex] = {
         ...updatedExperience[expIndex],
         [field]: value,
      };
      handleEdit("professionalExperience", updatedExperience);
   };

   const handleResponsibilityEdit = (expIndex, respIndex, value) => {
      const updatedExperience = [...resumeData.professionalExperience];
      const updatedResponsibilities = [
         ...updatedExperience[expIndex].responsibilities,
      ];
      updatedResponsibilities[respIndex] = value;
      updatedExperience[expIndex] = {
         ...updatedExperience[expIndex],
         responsibilities: updatedResponsibilities,
      };
      handleEdit("professionalExperience", updatedExperience);
   };

   const handleAddResponsibility = (expIndex) => {
      const updatedExperience = [...resumeData.professionalExperience];
      const updatedResponsibilities = [
         ...updatedExperience[expIndex].responsibilities,
      ];
      updatedResponsibilities.push("");
      updatedExperience[expIndex] = {
         ...updatedExperience[expIndex],
         responsibilities: updatedResponsibilities,
      };
      handleEdit("professionalExperience", updatedExperience);
   };

   const handleSaveToCustom = (expIndex, responsibility) => {
      onSaveCustomResponsibility(expIndex, responsibility);
      setAddedToCustom({ expIndex, resp: responsibility });
      setTimeout(() => setAddedToCustom(null), 2000);
   };

   // Function to check if responsibility is already in custom list
   const isResponsibilityInCustom = (expIndex, responsibility) => {
      const experience = userDetails.experience[expIndex];
      return (
         experience.customResponsibilities?.includes(responsibility) || false
      );
   };

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Spinner className="w-16 h-16" />
            <p className="text-lg font-semibold text-blue-600 text-center">
               Generating your resume, please hold on.
            </p>
            <p className="text-sm text-gray-500 text-center">
               This process may take a few moments. We appreciate your patience!
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         {resumeData && (
            <div className="space-y-4">
               <div className="flex gap-4">
                  <Button
                     onClick={() => setIsEditing(!isEditing)}
                     className="flex-1 flex items-center justify-center gap-2"
                     variant={isEditing ? "default" : "outline"}
                  >
                     {isEditing ? "Save Changes" : "Edit Resume"}
                     <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                     onClick={downloadAsWord}
                     className="flex-1 flex items-center justify-center gap-2"
                     variant="outline"
                  >
                     <Download className="w-4 h-4" />
                     Download as Word
                  </Button>
               </div>

               {/* PREVIEW */}
               <div className="bg-white text-black p-8 rounded-lg max-h-[600px] overflow-y-auto">
                  <div className="space-y-6">
                     {/* Header Section */}
                     <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">
                           {isEditing ? (
                              <input
                                 type="text"
                                 value={resumeData.fullName}
                                 onChange={(e) =>
                                    handleEdit("fullName", e.target.value)
                                 }
                                 className="w-full text-center border rounded p-1"
                              />
                           ) : (
                              resumeData.fullName
                           )}
                        </h1>
                        <p className="text-gray-600">
                           {isEditing ? (
                              <input
                                 type="text"
                                 value={resumeData.contactInformation}
                                 onChange={(e) =>
                                    handleEdit(
                                       "contactInformation",
                                       e.target.value
                                    )
                                 }
                                 className="w-full text-center border rounded p-1"
                              />
                           ) : (
                              resumeData.contactInformation
                           )}
                        </p>
                     </div>

                     {/* Professional Summary */}
                     <div>
                        <h2 className="text-xl font-bold border-b-2 mb-2">
                           Professional Summary
                        </h2>
                        {isEditing ? (
                           <textarea
                              value={resumeData.professionalSummary}
                              onChange={(e) =>
                                 handleEdit(
                                    "professionalSummary",
                                    e.target.value
                                 )
                              }
                              className="w-full border rounded p-2"
                              rows={4}
                           />
                        ) : (
                           <p className="text-sm">
                              {resumeData.professionalSummary}
                           </p>
                        )}
                     </div>

                     {/* Technical Skills */}
                     <div>
                        <h2 className="text-xl font-bold border-b-2 mb-2">
                           Technical Skills
                        </h2>
                        {isEditing ? (
                           <textarea
                              value={resumeData.technicalSkills}
                              onChange={(e) =>
                                 handleEdit("technicalSkills", e.target.value)
                              }
                              className="w-full border rounded p-2"
                              rows={2}
                           />
                        ) : (
                           <p className="text-sm">
                              {resumeData.technicalSkills}
                           </p>
                        )}
                     </div>

                     {/* Professional Experience */}
                     <div>
                        <h2 className="text-xl font-bold border-b-2 mb-2">
                           Professional Experience
                        </h2>
                        {resumeData.professionalExperience.map(
                           (exp, expIndex) => (
                              <div key={expIndex} className="mb-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       {isEditing ? (
                                          <div className="space-y-2">
                                             <input
                                                type="text"
                                                value={exp.title}
                                                onChange={(e) =>
                                                   handleExperienceEdit(
                                                      expIndex,
                                                      "title",
                                                      e.target.value
                                                   )
                                                }
                                                className="w-full border rounded p-1 font-bold"
                                             />
                                             <input
                                                type="text"
                                                value={exp.employer}
                                                onChange={(e) =>
                                                   handleExperienceEdit(
                                                      expIndex,
                                                      "employer",
                                                      e.target.value
                                                   )
                                                }
                                                className="w-full border rounded p-1"
                                             />
                                             <input
                                                type="text"
                                                value={exp.location || ""}
                                                onChange={(e) =>
                                                   handleExperienceEdit(
                                                      expIndex,
                                                      "location",
                                                      e.target.value
                                                   )
                                                }
                                                className="w-full border rounded p-1"
                                                placeholder="Location (optional)"
                                             />
                                          </div>
                                       ) : (
                                          <>
                                             <h3 className="font-bold">
                                                {exp.title}
                                             </h3>
                                             <p className="text-sm">
                                                {exp.employer}
                                                {/* Display Location if available */}
                                                {exp.location &&
                                                   `, ${exp.location}`}
                                             </p>
                                          </>
                                       )}
                                    </div>
                                    {isEditing ? (
                                       <div className="space-x-2">
                                          <input
                                             type="text"
                                             value={exp.startDate}
                                             onChange={(e) =>
                                                handleExperienceEdit(
                                                   expIndex,
                                                   "startDate",
                                                   e.target.value
                                                )
                                             }
                                             className="w-24 border rounded p-1 text-sm"
                                          />
                                          <span>-</span>
                                          <input
                                             type="text"
                                             value={exp.endDate}
                                             onChange={(e) =>
                                                handleExperienceEdit(
                                                   expIndex,
                                                   "endDate",
                                                   e.target.value
                                                )
                                             }
                                             className="w-24 border rounded p-1 text-sm"
                                          />
                                       </div>
                                    ) : (
                                       <p className="text-sm text-gray-600">
                                          {exp.startDate} - {exp.endDate}
                                       </p>
                                    )}
                                 </div>
                                 <div>
                                    <ul className="list-disc ml-6 mt-2">
                                       {exp.responsibilities
                                          .filter(
                                             (resp) =>
                                                isEditing || resp.trim() !== ""
                                          )
                                          .map((resp, respIndex) => (
                                             <li
                                                key={respIndex}
                                                className={`text-sm mb-1 group flex items-start gap-2 ${
                                                   isEditing
                                                      ? "list-none"
                                                      : "list-disc"
                                                } ${
                                                   addedToCustom &&
                                                   addedToCustom.resp === resp
                                                      ? "bg-green-100"
                                                      : ""
                                                } hover:bg-gray-200`}
                                             >
                                                {isEditing ? (
                                                   <div className="flex-1 flex items-start gap-2">
                                                      <div className="flex-1 flex items-start gap-2">
                                                         <span className="mt-2">
                                                            •
                                                         </span>
                                                         <textarea
                                                            value={resp}
                                                            onChange={(e) =>
                                                               handleResponsibilityEdit(
                                                                  expIndex,
                                                                  respIndex,
                                                                  e.target.value
                                                               )
                                                            }
                                                            className="w-full border rounded p-2 min-h-[60px]"
                                                         />
                                                      </div>
                                                      <button
                                                         onClick={() => {
                                                            const updatedExperience =
                                                               [
                                                                  ...resumeData.professionalExperience,
                                                               ];
                                                            updatedExperience[
                                                               expIndex
                                                            ].responsibilities =
                                                               updatedExperience[
                                                                  expIndex
                                                               ].responsibilities.filter(
                                                                  (_, idx) =>
                                                                     idx !==
                                                                     respIndex
                                                               );
                                                            handleEdit(
                                                               "professionalExperience",
                                                               updatedExperience
                                                            );
                                                         }}
                                                         className="text-red-500 hover:text-red-700 p-1"
                                                      >
                                                         <span className="sr-only">
                                                            Delete
                                                         </span>
                                                         ×
                                                      </button>
                                                   </div>
                                                ) : (
                                                   <div className="flex items-start justify-between w-full gap-2">
                                                      <div className="flex items-start gap-2">
                                                         <span>•</span>
                                                         <span>{resp}</span>
                                                      </div>
                                                      {isResponsibilityInCustom(
                                                         expIndex,
                                                         resp
                                                      ) ? (
                                                         <span className="opacity-0 group-hover:opacity-100 text-xs bg-gray-600 text-white px-2 py-1 rounded transition-all">
                                                            Saved in Custom
                                                         </span>
                                                      ) : (
                                                         <button
                                                            onClick={() =>
                                                               handleSaveToCustom(
                                                                  expIndex,
                                                                  resp
                                                               )
                                                            }
                                                            className="opacity-0 group-hover:opacity-100 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-all"
                                                         >
                                                            Save to Custom
                                                         </button>
                                                      )}
                                                   </div>
                                                )}
                                             </li>
                                          ))}
                                    </ul>

                                    {/* Add new responsibility button */}
                                    {isEditing && (
                                       <button
                                          onClick={() =>
                                             handleAddResponsibility(expIndex)
                                          }
                                          className="mt-2 ml-6 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                       >
                                          <span>+</span> Add New Responsibility
                                       </button>
                                    )}
                                 </div>
                              </div>
                           )
                        )}
                     </div>

                     {/* Education */}
                     {resumeData.education &&
                        resumeData.education.length > 0 && (
                           <div className="mt-6">
                              <h2 className="text-xl font-bold mb-4 border-b-2">
                                 Education
                              </h2>
                              <ul className="list-disc ml-6">
                                 {resumeData.education.map((edu, index) => (
                                    <li key={index} className="mb-2">
                                       <span className="font-semibold">
                                          {edu.degree}
                                       </span>{" "}
                                       - {edu.institution}, {edu.year}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}

                     {/* Certifications Section */}
                     {resumeData.certifications &&
                        resumeData.certifications.length > 0 && (
                           <div className="mt-6">
                              <h2 className="text-xl font-bold mb-4 border-b-2">
                                 Certifications
                              </h2>
                              <ul className="list-disc ml-6">
                              {resumeData.certifications.map((cert, index) => (
                                 <li key={index} className="mb-2">
                                    <span className="font-semibold">
                                       {typeof cert === "string"
                                          ? cert
                                          : cert.name || "Unnamed Certification"}
                                    </span>
                                 </li>
                              ))}
                              </ul>
                           </div>
                        )}

                     {/* Projects Section */}
                     {resumeData.projects && resumeData.projects.length > 0 && (
                        <div className="mt-6">
                           <h2 className="text-xl font-bold mb-4 border-b-2">
                              Projects
                           </h2>
                           <ul className="list-disc ml-6">
                           {resumeData.projects.map((project, index) => (
                              <li key={index} className="mb-4">
                                 <div className="flex flex-col">
                                    <span className="font-semibold">
                                       {project.name || "Unnamed Project"}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                       {project.description || "No description available"}
                                    </span>
                                 </div>
                              </li>
                           ))}
                           </ul>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default ResumePreview;
