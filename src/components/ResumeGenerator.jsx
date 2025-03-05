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
import { UserDetailsService } from "../services/UserDetailsService";
import { setUserDetails } from "../store/slices/firebaseSlice";
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
import { toast, Toaster } from "sonner";

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
  const { combinedSkills } = useSelector((state) => state.skills);
  const [resumeContent, setResumeContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshPreview, setRefreshPreview] = useState(false);

  const totalExperience = userDetails?.experience
    ? calculateTotalExperience(userDetails.experience)
    : 0;

  // Function to get all unique skills
  const getAllSkills = () => {
    const mappedSkills = combinedSkills?.map((mapping) => mapping.skill) || [];
    const customSkills = userDetails?.customSkills?.map((cs) => cs.skill) || [];

    // Combine and deduplicate all skills
    return [...new Set([...mappedSkills, ...customSkills])];
  };

  const generateResponsibilities = async (experience) => {
    console.log('Current experience:', experience.title);
    console.log('Combined skills from Redux:', combinedSkills);

    // Just deduplicate the skills array when mapping
    const relevantSkills = [...new Set(
      combinedSkills
        .filter(skillObj => skillObj.experienceMappings?.includes(experience.title))
        .map(skillObj => skillObj.skill)
    )];

    console.log('Relevant skills for', experience.title, ':', relevantSkills);

    // Keep the original prompt logic
    const prompt = experience.responsibilityType === "skillBased"
      ? `Generate EXACTLY 8 detailed technical responsibilities that:
          1. Use these technical skills: ${relevantSkills.join(", ")}
          2. MUST NOT mention or reference the job title
          3. Focus purely on technical implementation and achievements using these skills
          4. Each responsibility should demonstrate hands-on work with these specific technologies
          5. Do NOT add any skills or technologies that are not in the provided list
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

    const response = JSON.parse(completion.choices[0].message.content || "{}");
    return response.responsibilities || [];
  };

  const generateProfessionalSummary = async (
    totalExperience,
    technicalSkills,
    latestRole
  ) => {
    const allSkills = getAllSkills();

    console.log(technicalSkills, "technicalSkillsINSUMM");
    console.log(latestRole, "latestRoleINSUMM");
    console.log(totalExperience, "totalExperienceINSUMM");
    const prompt = `Generate a detailed professional summary that:
      1. Highlights ${totalExperience} years of total experience
      2. Incorporates key technical skills: ${allSkills.join(", ")}
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

    const response = JSON.parse(completion.choices[0].message.content || "{}");
    return response.summary || "";
  };

  const generateResume = async () => {
    if (!user?.uid) {
      console.log("Please login to generate resume");
      toast.error("Please login to generate resume");
      return;
    }

    const hasQuota = await QuotaService.checkQuota(user.uid, "generates");
    if (!hasQuota) {
      toast.error("Generate quota exceeded. Please upgrade your plan.");
      console.log("Generate quota exceeded. Please upgrade your plan.");

      return;
    }
    const allSkills = getAllSkills();

    setLoading(true);
    try {
      console.log("Using combined skills from Redux:", combinedSkills);
      const generatedExperiences = await Promise.all(
        userDetails.experience.map((exp) =>
          generateResponsibilities(exp)
        )
      );

      // Get latest role for professional summary
      const latestRole = userDetails.experience[0]?.title || "Professional";
      const generatedSummary = await generateProfessionalSummary(
        totalExperience,
        combinedSkills,
        latestRole
      );
      // Create the complete resume content
      const newResumeContent = {
        fullName: userDetails.fullName,
        contactInformation: `${userDetails.email} | ${userDetails.phone}`,
        professionalSummary: generatedSummary,
        technicalSkills: allSkills.join(", "),
        professionalExperience: userDetails.experience.map((exp, index) => ({
          ...exp,
          responsibilities: [
            ...generatedExperiences[index],
            ...(exp.customResponsibilities || []),
          ],
        })),
        education: userDetails.education || [],
        certifications: userDetails.certifications || [],
        projects: userDetails.projects || [],
      };

      setResumeContent(newResumeContent);
      setRefreshPreview((prev) => !prev);

      await QuotaService.incrementUsage(user.uid, "generates");
    } catch (error) {
      console.error("Error generating resume:", error);
      console.log("Failed to generate resume. Please try again.");
      toast.error("Failed to generate resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomResponsibility = async (expIndex, responsibility) => {
    try {
      if (!user?.uid) {
        console.log("Please login to save custom responsibilities");
        toast.error("Please login to save custom responsibilities");
        return;
      }

      // Get current experience
      const experience = userDetails.experience[expIndex];

      // Check if responsibility already exists
      if (experience?.customResponsibilities?.includes(responsibility)) {
        console.log("This responsibility is already saved!");
        toast.error("This responsibility is already saved!");
        return;
      }

      // Create new array with existing and new responsibilities
      const updatedCustomResponsibilities = [
        ...(experience.customResponsibilities || []),
        responsibility,
      ];

      // Update the experience array
      const updatedExperiences = [...userDetails.experience];
      updatedExperiences[expIndex] = {
        ...experience,
        customResponsibilities: updatedCustomResponsibilities,
      };

      // Create updated user details
      const updatedUserDetails = {
        ...userDetails,
        experience: updatedExperiences,
      };

      // Save to Firestore
      await UserDetailsService.saveUserDetails(user.uid, updatedUserDetails);

      // Update Redux store with the correct action
      dispatch(setUserDetails(updatedUserDetails));

      // Show success message
      console.log("Responsibility saved successfully!");
      toast.success("Responsibility saved successfully!");
    } catch (error) {
      console.error("Error saving custom responsibility:", error);
      console.log("Failed to save responsibility. Please try again.");
      toast.error("Failed to save responsibility. Please try again.");
    }
  };

  const downloadAsWord = async (template) => {
    // Check quota before proceeding
    const hasQuota = await QuotaService.checkQuota(user?.uid, "downloads");
    if (!hasQuota) {
      console.log("Download quota exceeded. Please upgrade your plan.");
      toast.error("Download quota exceeded. Please upgrade your plan.");
      return;
    }

    try {
      const resumeData = typeof resumeContent === "string"
        ? JSON.parse(cleanJsonResponse(resumeContent))
        : resumeContent;

      if (!resumeData || !resumeData.professionalExperience) {
        throw new Error("Invalid resume data");
      }

      let doc;
      switch (template) {
        case "Standard":
          const { Standardformat } = await import("./templates/Standardformat");
          doc = Standardformat(resumeData);
          break;
        case "Hybrid":
          const { Hybridformat } = await import("./templates/Hybridformat");
          doc = Hybridformat(resumeData);
          break;
        case "ModernClean":
          const { ModernCleanFormat } = await import("./templates/ModernCleanFormat");
          doc = ModernCleanFormat(resumeData);
          break;
        default:
          const { Standardformat: defaultFormat } = await import("./templates/Standardformat");
          doc = defaultFormat(resumeData);
      }

      // Generate and download the document
      Packer.toBlob(doc).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resumeData.fullName || "Resume"}.docx`;
        link.click();
        window.URL.revokeObjectURL(url);
      });

      await QuotaService.incrementUsage(user.uid, "downloads");

      // Refresh the quota display
      //  await refreshUserQuota();
    } catch (error) {
      console.error("Error generating Word document:", error);
      console.log(
        "Error generating document. Please check the console for details and try again",
        error
      );
      toast.error(
        "Error generating document. Please check the console for details and try again.",
        error
      );
    }
  };

  return combinedSkills.length > 0 ? (
    <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl mt-6">
      {/* <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
         <CardTitle>Resume Generator</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="space-y-4 p-4">
          <Button
            onClick={generateResume}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg"
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
              isEditing={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  ) : null;
};

export default ResumeGenerator;
