//src/components/ResumeGenerator.jsx
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
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});
const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY,
});

// ─── Step Label ───────────────────────────────────────────────────────────────
function StepLabel({ number, icon, title, badge }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
          style={{ background: "#e0e7ff", color: "#3730a3" }}
        >
          {icon || number}
        </span>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {badge && (
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

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
    console.log("Current experience:", experience.title);
    console.log("Combined skills from Redux:", combinedSkills);

    // Just deduplicate the skills array when mapping
    const expIndex = userDetails.experience.indexOf(experience); // get current exp index

    const relevantSkills = [
      ...new Set(
        combinedSkills
          .filter((skillObj) => skillObj.experienceMappings?.includes(expIndex))
          .map((skillObj) => skillObj.skill),
      ),
    ];

    console.log("Relevant skills for", experience.title, ":", relevantSkills);

    // Keep the original prompt logic
    const prompt =
      experience.responsibilityType === "skillBased"
        ? `Generate EXACTLY 8 detailed technical responsibilities that:
        1. Use these technical skills: ${relevantSkills.join(", ")}
        2. MUST NOT mention or reference the job title
        3. Focus purely on technical implementation and achievements using these skills
        4. Each responsibility should demonstrate hands-on work with these specific technologies
        5. Do NOT add any skills or technologies not in the provided list
        Return ONLY a JSON object: { "responsibilities": [array of 8 strings] }`
        : `Generate EXACTLY 8 detailed responsibilities that:
        1. Are specific to the role of ${experience.title}
        2. MUST NOT mention any technical skills
        3. Focus on business impact and role-specific achievements
        4. Describe typical duties and accomplishments
        Return ONLY a JSON object: { "responsibilities": [array of 8 strings] }`;

    // const completion = await openai.chat.completions.create({
    //    model: "gpt-3.5-turbo",
    //    messages: [
    //       {
    //          role: "system",
    //          content:
    //             "You are a professional resume writer. Generate specific, detailed responsibilities in JSON format. Return ONLY the array of responsibilities, no additional text.",
    //       },
    //       {
    //          role: "user",
    //          content: prompt,
    //       },
    //    ],
    //    temperature: 0.7,
    //    max_tokens: 1000,
    //    response_format: { type: "json_object" },
    // });

    // const response = JSON.parse(
    //    completion.choices[0].message.content || "{}"
    // );

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional resume writer. Return ONLY valid JSON, no markdown, no backticks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(
        completion.choices[0].message.content || "{}",
      );
      return response.responsibilities || [];
    } catch (error) {
      console.error("Gemini responsibilities error:", error);
      return [];
    }
  };

  const generateProfessionalSummary = async (
    totalExperience,
    technicalSkills,
    latestRole,
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
      Return ONLY a JSON object in this format: { "summary": "your summary text string..." }`;

    //  const completion = await openai.chat.completions.create({
    //    model: "gpt-3.5-turbo",
    //    messages: [
    //      {
    //        role: "system",
    //        content:
    //          "You are a professional resume writer. Generate a compelling professional summary in JSON format. Return ONLY the summary text.",
    //      },
    //      {
    //        role: "user",
    //        content: prompt,
    //      },
    //    ],
    //    temperature: 0.7,
    //    max_tokens: 500,
    //    response_format: { type: "json_object" },
    //  });

    //  const response = JSON.parse(completion.choices[0].message.content || "{}");

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional resume writer. Return ONLY valid JSON, no markdown, no backticks.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(
        completion.choices[0].message.content || "{}",
      );
      return response.summary || "";
    } catch (error) {
      console.error("Gemini summary error:", error);
      return "";
    }
  };

  //   const generateSummaryAppend = async (savedSummary, skills) => {
  //     const skillList = skills
  //       ?.map((s) => s.skill || s)
  //       .filter(Boolean)
  //       .join(", ");
  //     const prompt = `The candidate has this existing professional summary:
  // "${savedSummary}"

  // The target job description requires these skills: ${skillList}

  // Write ONLY 1-2 concise sentences to append to this summary that naturally highlight how the candidate's background aligns with these specific skills.
  // Do not rewrite or repeat the existing summary. Do not add greetings or explanations.
  // Return ONLY a JSON object: { "appended": "your 1-2 sentences here" }`;

  //     try {
  //       const completion = await groq.chat.completions.create({
  //         model: "llama-3.3-70b-versatile",
  //         messages: [
  //           {
  //             role: "system",
  //             content:
  //               "You are a professional resume writer. Return ONLY valid JSON, no markdown, no backticks.",
  //           },
  //           { role: "user", content: prompt },
  //         ],
  //         temperature: 0.7,
  //         max_tokens: 200,
  //         response_format: { type: "json_object" },
  //       });

  //       const response = JSON.parse(
  //         completion.choices[0].message.content || "{}",
  //       );
  //       return response.appended || "";
  //     } catch (error) {
  //       console.error("Summary append error:", error);
  //       return "";
  //     }
  //   };

  const generateSummaryAppend = async (savedSummary, skills) => {
    const skillList = skills
      ?.map((s) => s.skill || s)
      .filter((s) => s && !savedSummary.toLowerCase().includes(s.toLowerCase()))
      .join(", ");

    console.log("[SummaryAppend] Skills not already in summary:", skillList);

    if (!skillList) {
      console.warn(
        "[SummaryAppend] All skills already mentioned in summary — nothing to append",
      );
      return "";
    }

    const prompt = `Given this existing professional summary:
"${savedSummary}"

Write EXACTLY 2 sentences (no more, no less) to append at the end of this summary.
These sentences must naturally mention the candidate's proficiency in: ${skillList}
Rules:
- Do NOT rewrite or repeat anything from the existing summary
- Do NOT start with "I" or "The candidate"
- Output ONLY the 2 new sentences, nothing else
Return ONLY JSON: { "appended": "sentence one. sentence two." }`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Return ONLY valid JSON with key 'appended'. No markdown, no explanation, no preamble.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 150, // tight limit forces brevity
        response_format: { type: "json_object" },
      });

      const response = JSON.parse(
        completion.choices[0].message.content || "{}",
      );
      console.log("[SummaryAppend] Appended result:", response.appended);
      return response.appended || "";
    } catch (error) {
      console.error("Summary append error:", error);
      return "";
    }
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

      // ── 1. Responsibilities — skip AI if mode is "none" ──────────────────
      const generatedExperiences = await Promise.all(
        userDetails.experience.map((exp, expIndex) => {
          // ← add expIndex
          if (exp.responsibilityType === "none") return Promise.resolve([]);
          return generateResponsibilities(exp, expIndex); // ← pass it
        }),
      );

      // ── 2. Summary — respect summaryMode ─────────────────────────────────
      const latestRole = userDetails.experience[0]?.title || "Professional";
      const mode = userDetails.summaryMode || "regenerate";
      console.log("[ResumeGen] Summary mode:", mode);
      console.log("[ResumeGen] Saved summary:", userDetails.savedSummary);

      let finalSummary = "";
      let summaryParts = null; // NEW — used by StandardPreview to highlight the new bit

      if (mode === "own") {
        // Use exactly as written — no AI call
        if (!userDetails.savedSummary?.trim()) {
          console.warn(
            "[ResumeGen] 'own' mode but savedSummary is empty — falling back to regenerate",
          );
          finalSummary = await generateProfessionalSummary(
            totalExperience,
            combinedSkills,
            latestRole,
          );
        } else {
          console.log("[ResumeGen] Using saved summary verbatim");
          finalSummary = userDetails.savedSummary;
        }
      } else if (mode === "append") {
        if (!userDetails.savedSummary?.trim()) {
          console.warn(
            "[ResumeGen] 'append' mode but savedSummary is empty — falling back to regenerate",
          );
          finalSummary = await generateProfessionalSummary(
            totalExperience,
            combinedSkills,
            latestRole,
          );
        } else {
          const appended = await generateSummaryAppend(
            userDetails.savedSummary,
            combinedSkills,
          );
          console.log("[ResumeGen] savedSummary:", userDetails.savedSummary);
          console.log("[ResumeGen] appended sentences:", appended);
          finalSummary =
            userDetails.savedSummary.trimEnd() +
            (appended ? " " + appended : "");

          // NEW — keep the two halves so the preview can color them differently
          summaryParts = {
            base: userDetails.savedSummary.trimEnd(),
            appended: appended || "",
          };
          console.log("[ResumeGen] final concatenated summary:", finalSummary);
          console.log("[ResumeGen] summaryParts", summaryParts);
        }
      } else {
        // "regenerate" — existing behaviour
        console.log("[ResumeGen] Regenerating summary from scratch");
        finalSummary = await generateProfessionalSummary(
          totalExperience,
          combinedSkills,
          latestRole,
        );
      }

      console.log("[ResumeGen] Final summary:", finalSummary);

      // Create the complete resume content
      const newResumeContent = {
        fullName: userDetails.fullName,
        contactInformation: `${userDetails.email} | ${userDetails.phone}`,
        // professionalSummary: generatedSummary,  // ❌ old
        professionalSummary: finalSummary, // ✅ new
        summaryParts: summaryParts,
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
      const resumeData =
        typeof resumeContent === "string"
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
          const { ModernCleanFormat } =
            await import("./templates/ModernCleanFormat");
          doc = ModernCleanFormat(resumeData);
          break;
        default:
          const { Standardformat: defaultFormat } =
            await import("./templates/Standardformat");
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
        error,
      );
      toast.error(
        "Error generating document. Please check the console for details and try again.",
        error,
      );
    }
  };

  return combinedSkills.length > 0 ? (
    <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl mt-6">
      {/* <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
         <CardTitle>Resume Generator</CardTitle>
      </CardHeader> */}

      <CardContent>
        <div className="text-xs text-gray-600 pb-1">
          <StepLabel
            number="1"
            icon="📋"
            title="Step 4: Generate Resume"
            badge="Autosaved"
          />
          <p>
            <strong>Note:</strong> Click <em>"Generate Resume"</em> to create a
            resume based on the analyzed job description and extracted skills,
            or generate it using only your saved custom data (no job description
            required).
          </p>
        </div>
        <div className="space-y-4 p-1 md:p-4 md:pt-1">
          {/* User Guide */}
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
