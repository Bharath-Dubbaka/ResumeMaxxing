import React, { useState } from "react";
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

const openai = new OpenAI({
   apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
   dangerouslyAllowBrowser: true,
});

const ResumeGenerator = () => {
   const { user } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const [resumeContent, setResumeContent] = useState("");
   const [loading, setLoading] = useState(false);
   const [refreshPreview, setRefreshPreview] = useState(false);

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
                  <div className="mt-6 space-y-6">
                     <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {resumeContent}
                     </pre>
                  </div>
               )}
               {/* <ResumePreview resumeContent={resumeContent} /> */}
            </div>
         </CardContent>
      </Card>
   );
};

export default ResumeGenerator;
