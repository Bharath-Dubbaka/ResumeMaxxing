import React, { useState, useEffect } from "react";
import { Trash2, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { toast, Toaster } from "sonner";

export default function StandardPreview({
   resumeData = {},
   isEditing = false,
   handleEdit = () => {},
   handleExperienceEdit = () => {},
   handleResponsibilityEdit = () => {},
   handleAddResponsibility = () => {},
   savedResponsibilities = {},
   handleSaveToCustom = () => {},
}) {
   if (!resumeData) return null;

   return (
      <div className="bg-white text-black px-4 py-8 md:px-8 md:py-8 rounded-lg max-h-[800px] overflow-y-auto">
         <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
               <h1 className="text-2xl font-bold">
                  {isEditing ? (
                     <input
                        type="text"
                        value={resumeData.fullName || ""}
                        onChange={(e) => handleEdit("fullName", e.target.value)}
                        className="w-full text-center border rounded p-1 focus:border-orange-500 focus:outline-none"
                     />
                  ) : (
                     resumeData.fullName
                  )}
               </h1>
               <p className="text-gray-600">
                  {isEditing ? (
                     <input
                        type="text"
                        value={resumeData.contactInformation || ""}
                        onChange={(e) =>
                           handleEdit("contactInformation", e.target.value)
                        }
                        className="w-full text-center border rounded p-1 focus:border-orange-500 focus:outline-none"
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
                     value={resumeData.professionalSummary || ""}
                     onChange={(e) =>
                        handleEdit("professionalSummary", e.target.value)
                     }
                     className="w-full border rounded p-2 focus:border-orange-500 focus:outline-none"
                     rows={4}
                  />
               ) : (
                  <p className="text-sm">{resumeData.professionalSummary}</p>
               )}
            </div>

            {/* Technical Skills */}
            <div>
               <h2 className="text-xl font-bold border-b-2 mb-2">
                  Technical Skills
               </h2>
               {isEditing ? (
                  <textarea
                     value={resumeData.technicalSkills || ""}
                     onChange={(e) =>
                        handleEdit("technicalSkills", e.target.value)
                     }
                     className="w-full border rounded p-2 focus:border-orange-500 focus:outline-none"
                     rows={2}
                  />
               ) : (
                  <p className="text-sm">{resumeData.technicalSkills}</p>
               )}
            </div>

            {/* Professional Experience */}
            <div>
               <h2 className="text-xl font-bold border-b-2 mb-2">
                  Professional Experience
               </h2>
               {resumeData.professionalExperience.map((exp, expIndex) => (
                  <div key={expIndex} className="mb-4">
                     <div className="flex justify-between items-start">
                        <div>
                           {isEditing ? (
                              <div className="space-y-2">
                                 <input
                                    type="text"
                                    value={exp.title || ""}
                                    onChange={(e) =>
                                       handleExperienceEdit(
                                          expIndex,
                                          "title",
                                          e.target.value
                                       )
                                    }
                                    className="w-full border rounded p-1 font-bold focus:border-orange-500 focus:outline-none"
                                 />
                                 <input
                                    type="text"
                                    value={exp.employer || ""}
                                    onChange={(e) =>
                                       handleExperienceEdit(
                                          expIndex,
                                          "employer",
                                          e.target.value
                                       )
                                    }
                                    className="w-full border rounded p-1 focus:border-orange-500 focus:outline-none"
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
                                    className="w-full border rounded p-1 focus:border-orange-500 focus:outline-none"
                                    placeholder="Location (optional)"
                                 />
                              </div>
                           ) : (
                              <>
                                 <h3 className="font-bold">{exp.title}</h3>
                                 <p className="text-sm">
                                    {exp.employer}
                                    {/* Display Location if available */}
                                    {exp.location && `, ${exp.location}`}
                                 </p>
                              </>
                           )}
                        </div>
                        {isEditing ? (
                           <div className="space-x-2">
                              <input
                                 type="text"
                                 value={exp.startDate || ""}
                                 onChange={(e) =>
                                    handleExperienceEdit(
                                       expIndex,
                                       "startDate",
                                       e.target.value
                                    )
                                 }
                                 className="w-24 border rounded p-1 text-sm focus:border-orange-500 focus:outline-none"
                              />
                              <span>-</span>
                              <input
                                 type="text"
                                 value={exp.endDate || ""}
                                 onChange={(e) =>
                                    handleExperienceEdit(
                                       expIndex,
                                       "endDate",
                                       e.target.value
                                    )
                                 }
                                 className="w-24 border rounded p-1 text-sm focus:border-orange-500 focus:outline-none"
                              />
                           </div>
                        ) : (
                           <p className="text-sm text-gray-600">
                              {exp.startDate} - {exp.endDate}
                           </p>
                        )}
                     </div>
                     <div>
                        <ul className="list-disc ml-2 md:ml-6 mt-2">
                           {exp.responsibilities
                              .filter((resp) => isEditing || resp.trim() !== "")
                              .map((resp, respIndex) => (
                                 <li
                                    key={respIndex}
                                    className={`text-sm mb-1 group flex items-start gap-2 ${
                                       isEditing ? "list-none" : "list-disc"
                                    } ${
                                       savedResponsibilities[
                                          `${expIndex}-${resp}`
                                       ]
                                          ? "bg-green-100"
                                          : ""
                                    } hover:bg-gray-200`}
                                 >
                                    {isEditing ? (
                                       <div className="flex-1 flex items-start gap-2">
                                          <div className="flex-1 flex items-start gap-2">
                                             <span className="mt-2">•</span>
                                             <textarea
                                                value={resp || ""}
                                                onChange={(e) =>
                                                   handleResponsibilityEdit(
                                                      expIndex,
                                                      respIndex,
                                                      e.target.value
                                                   )
                                                }
                                                className="w-full border rounded p-2 min-h-[60px] focus:border-orange-500 focus:outline-none"
                                             />
                                          </div>
                                          <button
                                             onClick={() => {
                                                const updatedExperience = [
                                                   ...resumeData.professionalExperience,
                                                ];
                                                updatedExperience[
                                                   expIndex
                                                ].responsibilities =
                                                   updatedExperience[
                                                      expIndex
                                                   ].responsibilities.filter(
                                                      (_, idx) =>
                                                         idx !== respIndex
                                                   );
                                                handleEdit(
                                                   "professionalExperience",
                                                   updatedExperience
                                                );
                                             }}
                                             className="text-orange-500 hover:text-orange-700 p-1 bg-gray-100 rounded-lg flex justify-center items-center align-middle focus:border-orange-500 focus:outline-none"
                                          >
                                             <span className="sr-only">
                                                Delete
                                             </span>
                                             <Trash2 className="w-8 h-full flex justify-center items-center" />
                                          </button>
                                       </div>
                                    ) : (
                                       <div className="flex items-start justify-between w-full gap-1 md:gap-2">
                                          <div className="flex items-start gap-2">
                                             <span>•</span>
                                             <span>{resp}</span>
                                          </div>
                                          {savedResponsibilities[
                                             `${expIndex}-${resp}`
                                          ] ? (
                                             <span className="opacity-50 group-hover:opacity-100 text-xs bg-gray-600 text-white px-2 py-1 rounded transition-all">
                                                {/* Mobile: "Saved", Tablet+: "Saved in Custom" */}
                                                <span className="sm:hidden">
                                                   Saved
                                                </span>
                                                <span className="hidden sm:inline">
                                                   Saved in Custom
                                                </span>
                                             </span>
                                          ) : (
                                             <button
                                                onClick={() =>
                                                   handleSaveToCustom(
                                                      expIndex,
                                                      resp
                                                   )
                                                }
                                                className="opacity-50 group-hover:opacity-100 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-all"
                                             >
                                                {/* Mobile: "Save", Tablet+: "Save to Custom" */}
                                                <span className="sm:hidden">
                                                   Save
                                                </span>
                                                <span className="hidden sm:inline">
                                                   Save to Custom
                                                </span>
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
                              onClick={() => handleAddResponsibility(expIndex)}
                              className="mt-2 ml-6 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                           >
                              <span>+</span> Add New Responsibility
                           </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
               <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4 border-b-2">
                     Education
                  </h2>
                  <ul className="list-disc ml-6">
                     {resumeData.education.map((edu, index) => (
                        <li key={index} className="mb-2">
                           <span className="font-semibold">{edu.degree}</span> -{" "}
                           {edu.institution}
                           {edu.startDate && edu.endDate && (
                              <span className="text-gray-600">
                                 , {edu.startDate.split("-")[0]} -{" "}
                                 {edu.endDate.split("-")[0]}
                              </span>
                           )}
                        </li>
                     ))}
                  </ul>
               </div>
            )}

            {/* Certifications */}
            {resumeData.certifications &&
               resumeData.certifications.length > 0 && (
                  <div className="mt-6">
                     <h2 className="text-xl font-bold mb-4 border-b-2">
                        Certifications
                     </h2>
                     <ul className="list-disc ml-6">
                        {resumeData.certifications.map((cert, index) => (
                           <li key={index} className="mb-2">
                              <span className="font-semibold">{cert.name}</span>
                              {cert.issuer && <span> - {cert.issuer}</span>}
                              {cert.issueDate && (
                                 <span className="text-gray-600">
                                    , {cert.issueDate.split("-")[0]}
                                 </span>
                              )}
                              {cert.expiryDate && (
                                 <span className="text-gray-600">
                                    {" "}
                                    ({cert.expiryDate.split("-")[0]})
                                 </span>
                              )}
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
                                 {project.description ||
                                    "No description available"}
                              </span>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
            )}
         </div>
      </div>
   );
}
