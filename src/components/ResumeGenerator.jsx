import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { useSelector } from "react-redux";
import { QuotaService } from "../services/QuotaService";
import OpenAI from "openai";
import { Download, Edit } from "lucide-react";
import {
   Document,
   Packer,
   Paragraph,
   TextRun,
   // HeadingLevel,
   TabStopType,
   AlignmentType,
   BorderStyle,
} from "docx";
const openai = new OpenAI({
   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
   dangerouslyAllowBrowser: true,
});

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

const ResumeGenerator = () => {
   const { user } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const [resumeContent, setResumeContent] = useState("");
   const [loading, setLoading] = useState(false);
   const [refreshPreview, setRefreshPreview] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [resumeData, setResumeData] = useState(null);
   const [addedToCustom, setAddedToCustom] = useState(null);
   console.log(user, "user");
   useEffect(() => {
      if (resumeContent) {
         setResumeData(
            typeof resumeContent === "string"
               ? JSON.parse(resumeContent)
               : resumeContent
         );
      }
   }, [resumeContent]);

   const generateResponsibilities = async (
      experience,
      technicalSkills,
      skillMappings
   ) => {
      const relevantSkills = technicalSkills.filter((skill) => {
         const mapping = skillMappings.find((m) => m.skill === skill);
         return mapping?.experienceMappings.includes(experience.title);
      });

      const prompt =
         experience.responsibilityType === "skillBased"
            ? `Generate EXACTLY 8 detailed technical responsibilities that:
         1. Use ONLY these technical skills: ${relevantSkills.join(", ")}
         2. MUST NOT mention or reference the job title
         3. Focus purely on technical implementation and achievements
         4. Each responsibility should demonstrate hands-on technical work
         Return ONLY an array of 8 responsibilities in JSON format.`
            : `Generate EXACTLY 8 detailed responsibilities that:
         1. Are specific to the role of ${experience.title}
         2. MUST NOT mention any technical skills
         3. Focus on business impact and role-specific achievements
         4. Describe typical duties and accomplishments
         Return ONLY an array of 8 responsibilities in JSON format.`;

      const completion = await openai.chat.completions.create({
         model: "gpt-3.5-turbo",
         messages: [
            {
               role: "system",
               content:
                  "You are a professional resume writer. Generate specific, detailed responsibilities in JSON format. Return ONLY the array of responsibilities, no additional text.",
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

      const response = JSON.parse(
         completion.choices[0].message.content || "{}"
      );
      return response.responsibilities || [];
   };

   const generateProfessionalSummary = async (
      totalExperience,
      technicalSkills,
      latestRole
   ) => {
      const prompt = `Generate a detailed professional summary that:
      1. Highlights ${totalExperience} years of total experience
      2. Incorporates key technical skills: ${technicalSkills.join(", ")}
      3. Mentions current/latest role as ${latestRole}
      4. Focuses on career progression and expertise
      5. Is approximately 6-8 sentences long
      Return ONLY the summary text in JSON format.`;

      const completion = await openai.chat.completions.create({
         model: "gpt-3.5-turbo",
         messages: [
            {
               role: "system",
               content:
                  "You are a professional resume writer. Generate a compelling professional summary in JSON format. Return ONLY the summary text.",
            },
            {
               role: "user",
               content: prompt,
            },
         ],
         temperature: 0.7,
         max_tokens: 500,
         response_format: { type: "json_object" },
      });

      const response = JSON.parse(
         completion.choices[0].message.content || "{}"
      );
      return response.summary || "";
   };

   const generateResume = async () => {
      if (!user?.uid) {
         alert("Please login to generate resume");
         return;
      }

      const hasQuota = await QuotaService.checkQuota(user.uid, "generates");
      if (!hasQuota) {
         alert("Generate quota exceeded. Please upgrade your plan.");
         return;
      }

      setLoading(true);
      try {
         // Here you would integrate with your job description analysis to get technical skills
         // For now using placeholder data
         const technicalSkills = ["React", "JavaScript", "Node.js"];
         const totalExperience = "5";

         const generatedResponsibilities = await Promise.all(
            userDetails.experience.map((exp) =>
               generateResponsibilities(exp, technicalSkills, [])
            )
         );

         const latestRole = userDetails.experience[0]?.title || "Professional";
         const generatedSummary = await generateProfessionalSummary(
            totalExperience,
            technicalSkills,
            latestRole
         );

         const resumeContent = {
            fullName: userDetails.fullName,
            contactInformation: `${userDetails.email} | ${userDetails.phone}`,
            professionalSummary: generatedSummary,
            technicalSkills: technicalSkills.join(", "),
            professionalExperience: userDetails.experience.map(
               (exp, index) => ({
                  title: exp.title,
                  employer: exp.employer,
                  startDate: exp.startDate,
                  endDate: exp.endDate,
                  location: exp.location,
                  responsibilities: generatedResponsibilities[index],
               })
            ),
            education: userDetails.education || [],
            certifications: userDetails.certifications || [],
            projects: userDetails.projects || [],
         };

         setResumeContent(JSON.stringify(resumeContent));
         setRefreshPreview(!refreshPreview);

         await QuotaService.incrementUsage(user.uid, "generates");
      } catch (error) {
         console.error("Error generating resume:", error);
         alert("Error generating resume content. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const handleEdit = (field, value) => {
      const updatedData = {
         ...resumeData,
         [field]: value,
      };
      setResumeData(updatedData);

      try {
         const jsonString = JSON.stringify(updatedData);
         const cleanedJson = cleanJsonResponse(jsonString);
         setResumeContent(cleanedJson);
      } catch (error) {
         console.error("Error processing resume data:", error);
      }
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
      // Implement your custom responsibility saving logic here
      setAddedToCustom({ expIndex, resp: responsibility });
      setTimeout(() => setAddedToCustom(null), 2000);
   };

   const downloadAsWord = async () => {
      // Check quota before proceeding
      const hasQuota = await QuotaService.checkQuota(user?.uid, "downloads");
      if (!hasQuota) {
         alert("Download quota exceeded. Please upgrade your plan."); // Alert for user feedback
         return; // Exit the function if no quota
      }

      // Directly use the resumeContent assuming it is already cleaned
      // console.log(resumeContent, "ResumeContent inside downloadAsWord");
      const resumeData = JSON.parse(resumeContent); // resumeContent is now used directly without cleaning
      // console.log(resumeData, "after json  inside downloadAsWord");
      try {
         const doc = new Document({
            sections: [
               {
                  properties: {
                     page: {
                        margin: {
                           top: 720, // 0.5 inches
                           right: 720, // 0.5 inches
                           bottom: 720, // 0.5 inches
                           left: 720, // 0.5 inches
                        },
                     },
                  },
                  children: [
                     // Header Section - Centered
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: resumeData.fullName,
                              bold: true,
                              size: 36, // Increased for better header visibility
                              font: "Roboto",
                           }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                     }),
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: resumeData.contactInformation,
                              size: 24,
                              color: "666666", // Gray color to match preview
                              font: "Roboto",
                           }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                     }),

                     // Professional Summary
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: "Professional Summary",
                              bold: true,
                              size: 28,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { before: 400, after: 200 },
                        border: {
                           bottom: {
                              color: "999999",
                              size: 1,
                              style: BorderStyle.SINGLE,
                           },
                        },
                     }),
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: resumeData.professionalSummary,
                              size: 24,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { after: 400 },
                     }),

                     // Technical Skills
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: "Technical Skills",
                              bold: true,
                              size: 28,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { before: 400, after: 200 },
                        border: {
                           bottom: {
                              color: "999999",
                              size: 1,
                              style: BorderStyle.SINGLE,
                           },
                        },
                     }),
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: resumeData.technicalSkills,
                              size: 24,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { after: 400 },
                     }),

                     // Professional Experience
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: "Professional Experience",
                              bold: true,
                              size: 28,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { before: 400, after: 200 },
                        border: {
                           bottom: {
                              color: "999999",
                              size: 1,
                              style: BorderStyle.SINGLE,
                           },
                        },
                     }),
                     ...resumeData.professionalExperience.flatMap((exp) => [
                        // Title and Dates
                        new Paragraph({
                           children: [
                              new TextRun({
                                 text: exp.title,
                                 bold: true,
                                 size: 26,
                                 font: "Roboto",
                              }),
                              new TextRun({
                                 text: `\t${exp.startDate} - ${exp.endDate}`,
                                 size: 24,
                                 color: "666666", // Gray color to match preview
                                 font: "Roboto",
                              }),
                           ],
                           spacing: { before: 300, after: 100 },
                           tabStops: [
                              {
                                 type: TabStopType.RIGHT,
                                 position: 9000,
                              },
                           ],
                        }),
                        // Employer and Location
                        new Paragraph({
                           children: [
                              new TextRun({
                                 text: exp.employer,
                                 size: 24,
                                 font: "Roboto",
                              }),
                              new TextRun({
                                 text: `, ${exp.location}`,
                                 size: 24,
                                 font: "Roboto",
                              }),
                           ],
                           spacing: { before: 100, after: 200 },
                        }),
                        // Responsibilities (custom and generated merged)
                        ...exp.responsibilities.map(
                           (responsibility) =>
                              new Paragraph({
                                 children: [
                                    new TextRun({
                                       text: responsibility,
                                       size: 24,
                                       font: "Roboto",
                                    }),
                                 ],
                                 bullet: {
                                    level: 0,
                                 },
                                 indent: { left: 720 }, // Indent for bullet points
                                 spacing: { before: 100, after: 100 },
                              })
                        ),
                     ]),

                     // Education
                     new Paragraph({
                        children: [
                           new TextRun({
                              text: "Education",
                              bold: true,
                              size: 28,
                              font: "Roboto",
                           }),
                        ],
                        spacing: { before: 400, after: 200 },
                        border: {
                           bottom: {
                              color: "999999",
                              size: 1,
                              style: BorderStyle.SINGLE,
                           },
                        },
                     }),
                     ...resumeData.education
                        .map((edu) => [
                           new Paragraph({
                              children: [
                                 new TextRun({
                                    text: `${edu.degree} - ${edu.institution}, ${edu.year}`,
                                    bold: true,
                                    size: 24,
                                    font: "Roboto",
                                 }),
                              ],
                              bullet: {
                                 level: 0,
                              },
                              spacing: { before: 100 },
                           }),
                        ])
                        .flat(),

                     // Soft Skills (only if data exists)
                     // ...(resumeData.softSkills &&
                     // resumeData.softSkills.length > 0
                     //    ? [
                     //         new Paragraph({
                     //            children: [
                     //               new TextRun({
                     //                  text: "Soft Skills",
                     //                  bold: true,
                     //                  size: 28,
                     //               }),
                     //            ],
                     //            spacing: { before: 400, after: 200 },
                     //            border: {
                     //               bottom: {
                     //                  color: "999999",
                     //                  size: 1,
                     //                  style: BorderStyle.SINGLE,
                     //               },
                     //            },
                     //         }),
                     //         new Paragraph({
                     //            children: [
                     //               new TextRun({
                     //                  text: resumeData.softSkills.join(", "), // Join skills by commas
                     //                  size: 24,
                     //               }),
                     //            ],
                     //            spacing: { after: 400 },
                     //         }),
                     //      ]
                     //    : []),

                     // Certifications (only if data exists)
                     ...(resumeData.certifications &&
                     resumeData.certifications.length > 0
                        ? [
                             new Paragraph({
                                children: [
                                   new TextRun({
                                      text: "Certifications",
                                      bold: true,
                                      size: 28,
                                      font: "Roboto",
                                   }),
                                ],
                                spacing: { before: 400, after: 200 },
                                border: {
                                   bottom: {
                                      color: "999999",
                                      size: 1,
                                      style: BorderStyle.SINGLE,
                                   },
                                },
                             }),
                             ...resumeData.certifications
                                .map((cert) => [
                                   new Paragraph({
                                      children: [
                                         new TextRun({
                                            text: cert,
                                            size: 24,
                                            font: "Roboto",
                                         }),
                                      ],
                                      bullet: {
                                         level: 0,
                                      },
                                      spacing: { before: 100, after: 100 },
                                   }),
                                ])
                                .flat(),
                          ]
                        : []),

                     // Projects (only if data exists)
                     ...(resumeData.projects && resumeData.projects.length > 0
                        ? [
                             new Paragraph({
                                children: [
                                   new TextRun({
                                      text: "Projects",
                                      bold: true,
                                      size: 28,
                                      font: "Roboto",
                                   }),
                                ],
                                spacing: { before: 400, after: 200 },
                                border: {
                                   bottom: {
                                      color: "999999",
                                      size: 1,
                                      style: BorderStyle.SINGLE,
                                   },
                                },
                             }),
                             ...resumeData.projects
                                .map((project) => [
                                   new Paragraph({
                                      children: [
                                         new TextRun({
                                            text: project.name,
                                            size: 24,
                                            font: "Roboto",
                                         }),
                                      ],
                                      bullet: {
                                         level: 0,
                                      },
                                      spacing: { before: 100 },
                                   }),
                                   new Paragraph({
                                      children: [
                                         new TextRun({
                                            text: project.description,
                                            size: 24,
                                            font: "Roboto",
                                         }),
                                      ],
                                      spacing: { before: 0, after: 200 }, // Add spacing after description
                                      indent: { left: 720 },
                                   }),
                                ])
                                .flat(),
                          ]
                        : []),
                  ],
               },
            ],
            styles: {
               paragraphStyles: [
                  {
                     id: "Normal",
                     name: "Normal",
                     quickFormat: true,
                     run: {
                        font: "Roboto",
                     },
                     paragraph: {
                        spacing: {
                           line: 360, // 1.5 line spacing
                        },
                     },
                  },
               ],
            },
         });

         Packer.toBlob(doc).then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "resume.docx";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
         });

         await QuotaService.incrementUsage(user.uid, "downloads");

         // Refresh the quota display
         //  await refreshUserQuota();
      } catch (error) {
         console.error("Error generating Word document:", error);
         alert(
            "Error generating document. Please check the console for details and try again."
         );
      }
   };

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Spinner className="w-16 h-16" />
            <p className="text-lg font-semibold text-blue-600 text-center">
               Generating your resume, please hold on.
            </p>
         </div>
      );
   }

   return (
      <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl">
         <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
               Resume Generator
            </CardTitle>
         </CardHeader>
         <CardContent className="p-6">
            <div className="space-y-4">
               <Button
                  onClick={generateResume}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={loading}
               >
                  Generate Resume
               </Button>

               {resumeData && (
                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <Button
                           onClick={() => setIsEditing(!isEditing)}
                           className="flex-1 flex items-center justify-center gap-2"
                           variant="outline"
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

                     <div className="bg-white text-black p-8 rounded-lg max-h-[600px] overflow-y-auto">
                        {/* Resume Content Section */}
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
                                       handleEdit(
                                          "technicalSkills",
                                          e.target.value
                                       )
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
                                                </div>
                                             ) : (
                                                <>
                                                   <h3 className="font-bold">
                                                      {exp.title}
                                                   </h3>
                                                   <p className="text-sm">
                                                      {exp.employer}
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

                                       {/* Responsibilities */}
                                       <ul className="list-disc ml-6 mt-2">
                                          {exp.responsibilities.map(
                                             (resp, respIndex) => (
                                                <li
                                                   key={respIndex}
                                                   className={`text-sm mb-1 group flex items-start gap-2 ${
                                                      isEditing
                                                         ? "list-none"
                                                         : "list-disc"
                                                   }`}
                                                >
                                                   {isEditing ? (
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
                                                            className="w-full border rounded p-2"
                                                         />
                                                      </div>
                                                   ) : (
                                                      <div className="flex items-start justify-between w-full">
                                                         <span>{resp}</span>
                                                         <button
                                                            onClick={() =>
                                                               handleSaveToCustom(
                                                                  expIndex,
                                                                  resp
                                                               )
                                                            }
                                                            className="opacity-0 group-hover:opacity-100 text-xs bg-green-600 text-white px-2 py-1 rounded"
                                                         >
                                                            Save to Custom
                                                         </button>
                                                      </div>
                                                   )}
                                                </li>
                                             )
                                          )}
                                       </ul>

                                       {isEditing && (
                                          <button
                                             onClick={() =>
                                                handleAddResponsibility(
                                                   expIndex
                                                )
                                             }
                                             className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                          >
                                             + Add New Responsibility
                                          </button>
                                       )}
                                    </div>
                                 )
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
   );
};

export default ResumeGenerator;
