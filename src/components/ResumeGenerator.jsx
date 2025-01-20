import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { useSelector, useDispatch } from "react-redux";
import { QuotaService } from "../services/QuotaService";
import OpenAI from "openai";
import ResumePreview from "./ResumePreview";
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

const calculateTotalExperience = (experiences) => {
   let totalMonths = 0;

   experiences.forEach((exp) => {
      if (exp.startDate && exp.endDate) {
         const [startYear, startMonth] = exp.startDate.split("-").map(Number);
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


// Clean the JSON response to remove any extra text or formatting
function cleanJsonResponse(response) {
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
      }

const ResumeGenerator = () => {
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const { skills: technicalSkills } = useSelector((state) => state.skills);
   const [resumeContent, setResumeContent] = useState(null);
   const [loading, setLoading] = useState(false);
   const [refreshPreview, setRefreshPreview] = useState(false);

   const totalExperience = userDetails?.experience 
   ? calculateTotalExperience(userDetails.experience) 
   : 0;

   const generateResponsibilities = async (
      experience,
      technicalSkills,
      skillMappings
   ) => {

      // const relevantSkills = technicalSkills.filter((skill) => {
      //    const mapping = skillMappings.find((m) => m.skill === skill);
      //    return mapping?.experienceMappings.includes(experience.title);
      // });
console.log(technicalSkills, "technicalSkillsINRES");
console.log(experience, "experienceINRES");

      const prompt =
         experience.responsibilityType === "skillBased"
            ? `Generate EXACTLY 8 detailed technical responsibilities that:
         1. Use ONLY these technical skills: ${technicalSkills.join(", ")}
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
      console.log(technicalSkills, "technicalSkillsINSUMM");
      console.log(latestRole, "latestRoleINSUMM");
      console.log(totalExperience, "totalExperienceINSUMM");
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
         // Generate responsibilities for each experience separately
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

         setResumeContent(resumeContent);
         setRefreshPreview(!refreshPreview);

         await QuotaService.incrementUsage(user.uid, "generates");
      } catch (error) {
         console.error("Error generating resume:", error);
         alert("Error generating resume content. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const handleSaveCustomResponsibility = async (expIndex, responsibility) => {
      // Implement your custom responsibility saving logic here
      // This could involve updating Firebase or your backend
      console.log("Saving custom responsibility:", { expIndex, responsibility });
   };

   const downloadAsWord = async () => {
      // Check quota before proceeding
      const hasQuota = await QuotaService.checkQuota(user?.uid, "downloads");
      if (!hasQuota) {
         alert("Download quota exceeded. Please upgrade your plan."); // Alert for user feedback
         return; // Exit the function if no quota
      }

         // Clean and validate the response
         const cleanedContent = cleanJsonResponse(
            JSON.stringify(resumeContent)
         );
         const resumeData = JSON.parse(cleanedContent);

      // Directly use the resumeContent assuming it is already cleaned
      // console.log(resumeContent, "ResumeContent inside downloadAsWord");
      // const resumeData = JSON.parse(resumeContent); 
      // console.log(resumeData, "after json  inside downloadAsWord");
      try {
          // If resumeContent is a string, parse it; if it's an object, use it directly
          const resumeData = typeof resumeContent === 'string' 
          ? JSON.parse(cleanJsonResponse(resumeContent))
          : resumeContent;
          
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

   return (
      <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl">
         <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
            <CardTitle>Resume Generator</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-4 p-4">
               <Button
                  onClick={generateResume}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={loading}
               >
                  {loading ? (
                     <div className="flex items-center justify-center gap-2">
                        <Spinner className="w-4 h-4 border-2" />
                        Generating Resume...
                     </div>
                  ) : (
                     "Generate Resume"
                  )}
               </Button>

               {resumeContent && (
                  <ResumePreview
                     initialResumeContent={resumeContent}
                     onUpdate={setResumeContent}
                     downloadAsWord={downloadAsWord}
                     refresh={refreshPreview}
                     loading={loading}
                     onSaveCustomResponsibility={handleSaveCustomResponsibility}
                     userDetails={userDetails}
                  />
               )}
            </div>
         </CardContent>
      </Card>
   );
};

export default ResumeGenerator;
