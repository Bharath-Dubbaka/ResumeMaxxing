//src/components/JobDescriptionAnalyzer.jsx

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
import { GoogleGenAI } from "@google/genai";
import { setSkills } from "../store/slices/skillsSlice";
import { setSkillsMapped } from "../store/slices/skillsSlice";
import { MapIcon, Trash2, PlusCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import OpenAI from "openai";
import { UserDetailsService } from "../services/UserDetailsService";
import { setUserDetails } from "../store/slices/firebaseSlice";
import Groq from "groq-sdk";

const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY,
});
const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
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
// JDA category label — editable on click, saves on blur/Enter
function JDACategoryInput({
  categoryName,
  combinedSkills,
  onRename,
  isDragOver,
}) {
  const [local, setLocal] = useState(categoryName);
  useEffect(() => {
    setLocal(categoryName);
  }, [categoryName]);
  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const trimmed = local.trim();
        if (trimmed && trimmed !== categoryName)
          onRename(categoryName, trimmed);
        else setLocal(categoryName); // reset if empty or unchanged
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
        if (e.key === "Escape") setLocal(categoryName);
      }}
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#6366f1",
        background: "transparent",
        border: "none",
        outline: "none",
        borderBottom: isDragOver ? "2px solid #6366f1" : "1px dashed #c7d2fe",
        minWidth: 40,
        width: `${Math.max((local || "").length, 6)}ch`,
        padding: "1px 0",
        cursor: "text",
        transition: "border-color 0.15s",
      }}
      title="Click to rename — Enter or click away to save"
    />
  );
}

// JDA skill chip text — editable on click, saves on blur
function JDASkillInput({ value, onSave }) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onSave(local);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
        if (e.key === "Escape") setLocal(value);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#3730a3",
        background: "transparent",
        border: "none",
        outline: "none",
        width: `${Math.max((local || "").length, 3)}ch`,
        minWidth: 28,
        cursor: "text",
        padding: "3px",
      }}
      placeholder="skill"
    />
  );
}

export default function JobDescriptionAnalyzer() {
  const { user } = useSelector((state) => state.auth);
  const { userDetails } = useSelector((state) => state.firebase);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [skillMappings, setSkillMappings] = useState([]);
  const dropdownRef = useRef(null);
  const [combinedSkills, setCombinedSkills] = useState([]);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  useEffect(() => {
    if (skillMappings.length > 0) {
      removeDuplicateSkillMappings();
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // useEffect(() => {
  //   if (analysis?.technicalSkills && userDetails) {
  //     const allSkills = [
  //       ...analysis.technicalSkills,
  //       ...(userDetails.customSkills?.map((cs) => cs.skill) || []),
  //     ];
  //     setSkillMappings((prev) => {
  //       const allExperienceTitles = userDetails.experience.map(
  //         (exp) => exp.title,
  //       );
  //       const updatedMappings = allSkills.map((skill) => {
  //         const existingMapping = prev.find((m) => m.skill === skill);
  //         const customSkill = userDetails.customSkills?.find(
  //           (cs) => cs.skill === skill,
  //         );
  //         if (existingMapping) return existingMapping;
  //         if (customSkill) return customSkill;
  //         return {
  //           skill,
  //           experienceMappings: allExperienceTitles.map((_, i) => i),
  //         };
  //       });
  //       dispatch(setSkillsMapped(updatedMappings));
  //       return updatedMappings;
  //     });
  //   }
  // }, [analysis?.technicalSkills, userDetails]);
  useEffect(() => {
    if (analysis?.technicalSkills && userDetails) {
      const allSkills = [
        ...analysis.technicalSkills,
        ...(userDetails.customSkills?.map((cs) => cs.skill) || []),
      ];
      setSkillMappings((prev) => {
        const allIndices = userDetails.experience.map((_, i) => i); // ← indices

        const updatedMappings = allSkills.map((skill) => {
          const existingMapping = prev.find((m) => m.skill === skill);
          const customSkill = userDetails.customSkills?.find(
            (cs) => cs.skill === skill,
          );
          if (existingMapping) return existingMapping;
          if (customSkill) return customSkill;
          // new JD-extracted skill → map to ALL experiences by default
          return { skill, experienceMappings: [...allIndices] }; // ← was allExperienceTitles
        });
        dispatch(setSkillsMapped(updatedMappings));
        return updatedMappings;
      });
    }
  }, [analysis?.technicalSkills, userDetails]);

  // const initializeCombinedSkills = () => {
  //   const customSkillSet = new Set(
  //     userDetails?.customSkills?.map((cs) => cs.skill) || [],
  //   );
  //   const allIndices = userDetails?.experience?.map((_, i) => i) || []; // ← ADD THIS

  //   const generated =
  //     analysis?.technicalSkills
  //       ?.filter((skill) => !customSkillSet.has(skill))
  //       .map((skill) => ({
  //         skill,
  //         experienceMappings:
  //           skillMappings.find((m) => m.skill === skill)?.experienceMappings ||
  //           allIndices, // ← now defined
  //         type: "generated",
  //       })) || [];
  //   const custom =
  //     userDetails?.customSkills?.map((skill) => ({
  //       ...skill,
  //       type: "custom",
  //     })) || [];
  //   return [...generated, ...custom];
  // };

  // reads category from skillMappings
  const initializeCombinedSkills = () => {
    const customSkillSet = new Set(
      userDetails?.customSkills?.map((cs) => cs.skill) || [],
    );
    const allIndices = userDetails?.experience?.map((_, i) => i) || [];

    const generated =
      analysis?.technicalSkills
        ?.filter((skill) => !customSkillSet.has(skill))
        .map((skill) => {
          const mapping = skillMappings.find((m) => m.skill === skill);
          return {
            skill,
            experienceMappings: mapping?.experienceMappings || allIndices,
            category: mapping?.category || "Other", // ← KEY FIX
            type: "generated",
            _fromJD: true,
          };
        }) || [];

    const custom =
      userDetails?.customSkills?.map((s) => ({
        ...s,
        type: "custom",
      })) || [];

    return [...generated, ...custom];
  };

  useEffect(() => {
    if (
      (analysis?.technicalSkills || userDetails?.customSkills) &&
      skillMappings.length > 0
    ) {
      const initialSkills = initializeCombinedSkills();
      if (JSON.stringify(initialSkills) !== JSON.stringify(combinedSkills)) {
        setCombinedSkills(initialSkills);
        dispatch({ type: "skills/setCombinedSkills", payload: initialSkills });
      }
    }
  }, [skillMappings, userDetails?.customSkills, analysis?.technicalSkills]);

  const calculateTotalExperience = (experiences) => {
    let totalMonths = 0;
    experiences.forEach((exp) => {
      if (exp.startDate && exp.endDate) {
        const [startYear, startMonth] = exp.startDate.split("-").map(Number);
        const [endYear, endMonth] = exp.endDate.split("-").map(Number);
        const months = (endYear - startYear) * 12 + (endMonth - startMonth);
        totalMonths += Math.max(0, months);
      }
    });
    return (totalMonths / 12).toFixed(1);
  };

  const handleSkillMappingChange = (skill, expIndex, checked, isCustom) => {
    setSkillMappings((prev) => {
      if (isCustom) {
        const updatedCustom = userDetails.customSkills.map((cs) =>
          cs.skill === skill
            ? {
                ...cs,
                experienceMappings: checked
                  ? [...new Set([...cs.experienceMappings, expIndex])]
                  : cs.experienceMappings.filter((m) => m !== expIndex),
              }
            : cs,
        );
        dispatch(
          setUserDetails({ ...userDetails, customSkills: updatedCustom }),
        );
        return prev;
      }
      return prev.map((mapping) =>
        mapping.skill === skill
          ? {
              ...mapping,
              experienceMappings: checked
                ? [...new Set([...mapping.experienceMappings, expIndex])]
                : mapping.experienceMappings.filter((m) => m !== expIndex),
            }
          : mapping,
      );
    });
  };

  const handleDropdownToggle = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const removeDuplicateSkillMappings = useCallback(() => {
    setSkillMappings((prevMappings) => {
      const uniqueSkills = {};
      const uniqueMappings = [];
      for (const mapping of prevMappings) {
        const skill = mapping.skill;
        if (!uniqueSkills[skill]) {
          uniqueSkills[skill] = true;
          uniqueMappings.push(mapping);
        }
      }
      if (uniqueMappings.length !== prevMappings.length) return uniqueMappings;
      return prevMappings;
    });
  }, []);

  const handleAddSkill = () => {
    const newSkill = "";
    const allExperienceTitles =
      userDetails?.experience?.map((exp) => exp.title) || [];
    const allIndices = userDetails?.experience?.map((_, i) => i) || []; // ← indices

    const newSkillObj = {
      skill: newSkill,
      experienceMappings: allIndices,
      type: "generated",
    };
    const updatedTechnicalSkills = [
      ...(analysis?.technicalSkills || []),
      newSkill,
    ];
    setAnalysis((prev) => ({
      ...prev,
      technicalSkills: updatedTechnicalSkills,
    }));
    const updatedCombinedSkills = [...(combinedSkills || []), newSkillObj];
    setCombinedSkills(updatedCombinedSkills);
    setSkillMappings((prev) => {
      const emptySkillMapping = prev.find((m) => m.skill === "");
      if (emptySkillMapping) return prev;
      return [...prev, { skill: newSkill, experienceMappings: allIndices }];
    });
    dispatch({
      type: "skills/setCombinedSkills",
      payload: updatedCombinedSkills,
    });
    dispatch(setSkills(updatedTechnicalSkills));
  };

  const handleSkillChange = (newSkill, index) => {
    const skillObj = combinedSkills[index];
    if (!skillObj) return;
    const currentSkill = skillObj.skill;

    // Update combinedSkills display array
    setCombinedSkills((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], skill: newSkill };
      return updated;
    });

    if (skillObj.type === "custom") {
      // Custom skill — update userDetails.customSkills directly
      const updatedCustom = userDetails.customSkills.map((cs) =>
        cs.skill === currentSkill ? { ...cs, skill: newSkill } : cs,
      );
      dispatch(setUserDetails({ ...userDetails, customSkills: updatedCustom }));
      // Note: this is local Redux only, user must save via their master profile Save button
      // or you can call UserDetailsService.saveUserDetails here if you want auto-save
    } else {
      // Generated skill — update analysis and skillMappings
      setAnalysis((prev) => {
        if (!prev) return null;
        const updatedSkills = prev.technicalSkills.map((s) =>
          s === currentSkill ? newSkill : s,
        );
        return { ...prev, technicalSkills: updatedSkills };
      });
      setSkillMappings((prev) =>
        prev.map((mapping) =>
          mapping.skill === currentSkill
            ? { ...mapping, skill: newSkill }
            : mapping,
        ),
      );
      dispatch(
        setSkills((prevSkills) =>
          prevSkills.map((skill) =>
            skill === currentSkill ? newSkill : skill,
          ),
        ),
      );
    }
  };

  const handleRemoveSkill = (index) => {
    const skillToRemove = combinedSkills[index]?.skill;
    if (!skillToRemove && skillToRemove !== "") return;
    setCombinedSkills((prev) => prev.filter((_, i) => i !== index));
    setAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        technicalSkills: prev.technicalSkills.filter(
          (skill) => skill !== skillToRemove,
        ),
      };
    });
    setSkillMappings((prev) =>
      prev.filter((mapping) => mapping.skill !== skillToRemove),
    );
    dispatch({
      type: "skills/setCombinedSkills",
      payload: combinedSkills.filter((_, i) => i !== index),
    });
    dispatch(
      setSkills(
        analysis.technicalSkills.filter((skill) => skill !== skillToRemove),
      ),
    );
    dispatch(
      setSkillsMapped(
        skillMappings.filter((mapping) => mapping.skill !== skillToRemove),
      ),
    );
  };

  // It takes flat JD-extracted skill strings and the user's existing category structure,
  // then returns each new skill assigned to a category.

  async function categorizeNewSkills(newSkills, existingCategories) {
    if (!newSkills.length) return {};

    const existingContext =
      existingCategories.length > 0
        ? `The user's existing skill categories are (use EXACT spelling if reusing):
${existingCategories.map((c) => `  - "${c}"`).join("\n")}
Assign to an existing category only if it genuinely belongs there. Otherwise create a new specific one.`
        : `The user has no existing categories. Create appropriate ones from scratch.`;

    const prompt = `Categorize these skills for a professional resume. Return ONLY a flat JSON object.

${existingContext}

STRICT RULES — read carefully:
1. NEVER use "Technical Skills", "From Job Description", "Skills", or "Other" — too vague
2. Human spoken languages (Spanish, French, German, Chinese, Telugu, Hindi, Arabic, etc.) ALWAYS go under "Languages" — never under programming categories
3. CSS, SQL, HTML, PHP are "Programming Languages" — not soft skills, not tools
4. "Template Conversion", "Data Mapping", "Grouping Skills", "ETL" → "Data Processing"
5. "JavaScript", "TypeScript", "Python", "Java", "PHP" → "Programming Languages"
6. "React", "Vue", "Angular", "Next.js", "Express" → "Frameworks & Libraries"
7. "AWS", "Docker", "Kubernetes", "CI/CD" → "Cloud & DevOps"
8. "MySQL", "PostgreSQL", "MongoDB", "Redis" → "Databases"
9. "Machine Learning", "AI", "LLM", "GPT", "TensorFlow" → "AI & ML"
10. "Git", "Jira", "Figma", "Postman" → "Tools & Platforms"
11. "Communication", "Leadership", "Initiative", "Teamwork" → "Soft Skills"
12. New category names must be 2-4 words, specific and professional

Skills to categorize: ${JSON.stringify(newSkills)}

Return ONLY this exact JSON format, nothing else:
{"skill1": "Category Name", "skill2": "Category Name"}`;

    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a professional resume skill categorizer.
CRITICAL: Never use "Technical Skills", "From Job Description", "Skills", or "Other".
Human spoken languages ALWAYS go under "Languages".
CSS/SQL/HTML/PHP are "Programming Languages".
Return ONLY valid JSON, no markdown, no explanation.`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 600,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      console.log("[JDA] Categorization result:", result);

      // Post-process: catch any vague categories that slipped through
      const vague = new Set(["Skills", "Other", ""]);
      const humanLang =
        /^(spanish|french|german|chinese|japanese|arabic|portuguese|russian|italian|korean|hindi|telugu|tamil|bengali|urdu|dutch|swedish|turkish|polish)$/i;
      const progLang =
        /^(javascript|typescript|python|java|php|c\+\+|ruby|swift|kotlin|go|rust|css|sql|html|scala|perl|r|matlab)$/i;
      const frameworks =
        /react|vue|angular|next\.?js|express|django|laravel|spring|rails|svelte|fastapi/i;
      const cloud = /aws|azure|gcp|docker|kubernetes|terraform|jenkins|ci\/cd/i;
      const databases =
        /mysql|postgres|mongodb|redis|firebase|dynamodb|sqlite|oracle/i;
      const aiml =
        /machine learning|deep learning|ai\b|llm|gpt|bert|tensorflow|pytorch|nlp/i;
      const dataProc =
        /mapping|conversion|processing|transformation|pipeline|etl|grouping/i;
      const softSkill =
        /communication|leadership|teamwork|management|initiative|motivation|problem.solv/i;

      for (const skill of newSkills) {
        if (!result[skill] || vague.has(result[skill])) {
          if (humanLang.test(skill)) result[skill] = "Languages";
          else if (progLang.test(skill))
            result[skill] = "Programming Languages";
          else if (frameworks.test(skill))
            result[skill] = "Frameworks & Libraries";
          else if (cloud.test(skill)) result[skill] = "Cloud & DevOps";
          else if (databases.test(skill)) result[skill] = "Databases";
          else if (aiml.test(skill)) result[skill] = "AI & ML";
          else if (dataProc.test(skill)) result[skill] = "Data Processing";
          else if (softSkill.test(skill)) result[skill] = "Soft Skills";
          else result[skill] = "Tools & Platforms";
        }
      }

      return result;
    } catch (err) {
      console.error("[JDA] categorizeNewSkills error:", err);
      // Full rule-based fallback
      const humanLang =
        /^(spanish|french|german|chinese|japanese|arabic|portuguese|russian|italian|korean|hindi|telugu|tamil|bengali|urdu|dutch|swedish|turkish|polish)$/i;
      const fallback = {};
      for (const skill of newSkills) {
        if (humanLang.test(skill)) fallback[skill] = "Languages";
        else if (
          /javascript|typescript|python|java|php|css|sql|html/i.test(skill)
        )
          fallback[skill] = "Programming Languages";
        else if (/react|vue|angular|next|express|django|laravel/i.test(skill))
          fallback[skill] = "Frameworks & Libraries";
        else if (/aws|azure|gcp|docker|kubernetes/i.test(skill))
          fallback[skill] = "Cloud & DevOps";
        else if (/mysql|postgres|mongodb|redis/i.test(skill))
          fallback[skill] = "Databases";
        else if (/mapping|conversion|processing|grouping|etl/i.test(skill))
          fallback[skill] = "Data Processing";
        else if (/communication|leadership|initiative/i.test(skill))
          fallback[skill] = "Soft Skills";
        else fallback[skill] = "Tools & Platforms";
      }
      return fallback;
    }
  }

  // ─── REPLACE the analyzeJobDescription function body ─────────────────────────
  // The key addition is the categorization call after Groq extracts flat skills.

  // Key rule: NEVER touch userDetails or dispatch(setUserDetails(...)) here.
  // JD skills stay in skillMappings local state only.
  // Category is attached to each skillMapping entry so the chip UI can group them.
  // User explicitly saves a skill to master via the + (handleSaveToCustomSkills) button.

  const analyzeJobDescription = async () => {
    setIsAnalyzing(true);
    try {
      if (!user?.uid) throw new Error("User not authenticated");
      const hasQuota = await QuotaService.checkQuota(user.uid, "parsing");
      if (!hasQuota)
        throw new Error("Parsing quota exceeded. Please upgrade your plan.");

      const prompt = `Analyze this job description as a professional resume writer. Return ONLY a JSON object in this exact format, no other text:
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

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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

      const analysisResult = JSON.parse(
        completion.choices[0].message.content || "{}",
      );
      setAnalysis(analysisResult);
      dispatch(setSkills(analysisResult.technicalSkills));

      // ── Categorize JD skills and store in skillMappings LOCAL STATE only ──
      // Nothing touches userDetails. User saves explicitly via + button per chip.
      const jdSkills = analysisResult.technicalSkills || [];

      // Filter out skills user already has (JS Set, no AI)
      const userSkillNames = new Set(
        (userDetails?.customSkills || []).map((s) => s.skill),
      );
      const brandNewSkills = jdSkills.filter((s) => !userSkillNames.has(s));
      console.log(
        "[JDA] Brand new skills not in master profile:",
        brandNewSkills,
      );

      // Get user's existing category names for context
      const existingCategories = [
        ...new Set(
          (userDetails?.customSkills || [])
            .map((s) => s.category)
            .filter(Boolean),
        ),
      ];

      // Ask Groq which category each new skill belongs to
      const skillCategoryMap =
        brandNewSkills.length > 0
          ? await categorizeNewSkills(brandNewSkills, existingCategories)
          : {};

      // Build allIndices for experienceMappings
      const allIndices = (userDetails?.experience || []).map((_, i) => i);

      // Update skillMappings local state with category attached
      // This is what the chip UI reads — userDetails is untouched
      setSkillMappings((prev) => {
        const updatedMappings = jdSkills.map((skill) => {
          const existing = prev.find((m) => m.skill === skill);
          if (existing) return existing; // keep existing mapping if already there

          const customSkill = userDetails?.customSkills?.find(
            (cs) => cs.skill === skill,
          );
          if (customSkill) return customSkill; // already in master, use as-is

          // Brand new JD skill — attach category
          return {
            skill,
            category: skillCategoryMap[skill] || "Technical Skills",
            experienceMappings: [...allIndices],
          };
        });
        dispatch(setSkillsMapped(updatedMappings));
        return updatedMappings;
      });

      await QuotaService.incrementUsage(user.uid, "parsing");
      return analysisResult;
    } catch (error) {
      console.error("Analysis of JD error:", error);
      toast.error(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToCustomSkills = async (skill) => {
    const mapping = skillMappings.find((m) => m.skill === skill);
    const currentMappings = mapping?.experienceMappings || [];
    const category = mapping?.category || "Technical Skills";

    const newCustomSkill = {
      skill,
      category,
      experienceMappings: currentMappings,
    };

    // Remove from JDA generated list
    setAnalysis((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skill),
    }));

    const updatedUserDetails = {
      ...userDetails,
      customSkills: [...(userDetails.customSkills || []), newCustomSkill],
    };
    await UserDetailsService.saveUserDetails(user.uid, updatedUserDetails);
    dispatch(setUserDetails(updatedUserDetails));
  };

  const consolidateSkills = useCallback(() => {
    const generatedSkills = analysis?.technicalSkills || [];
    const customSkills = userDetails?.customSkills || [];
    const consolidatedMappings = [
      ...generatedSkills.map((skill) => ({
        skill,
        experienceMappings:
          skillMappings.find((m) => m.skill === skill)?.experienceMappings ||
          [],
      })),
      ...customSkills,
    ];
    dispatch(setSkillsMapped(consolidatedMappings));
    dispatch(setSkills(consolidatedMappings.map((s) => s.skill)));
  }, [
    analysis?.technicalSkills,
    userDetails?.customSkills,
    skillMappings,
    dispatch,
  ]);

  useEffect(() => {
    const hasSkills =
      analysis?.technicalSkills?.length > 0 ||
      userDetails?.customSkills?.length > 0;
    if (hasSkills && !isAnalyzing) consolidateSkills();
  }, [analysis?.technicalSkills, userDetails?.customSkills, isAnalyzing]);

  const handleUpdateMapping = (skillName, expTitle, isChecked) => {
    setCombinedSkills((prev) => {
      const updated = prev.map((skill) => {
        if (skill.skill === skillName) {
          const newMappings = isChecked
            ? [...new Set([...(skill.experienceMappings || []), expTitle])]
            : (skill.experienceMappings || []).filter(
                (exp) => exp !== expTitle,
              );
          return { ...skill, experienceMappings: newMappings };
        }
        return skill;
      });
      dispatch({ type: "skills/setCombinedSkills", payload: updated });
      return updated;
    });
  };

  const handleDeleteCustomSkill = async (skillToDelete) => {
    const updatedUserDetails = {
      ...userDetails,
      customSkills: userDetails.customSkills.filter(
        (skill) => skill.skill !== skillToDelete,
      ),
    };
    if (analysis?.technicalSkills.includes(skillToDelete)) {
      setAnalysis((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, skillToDelete],
      }));
    }
    await UserDetailsService.saveUserDetails(user.uid, updatedUserDetails);
    dispatch(setUserDetails(updatedUserDetails));
  };

  const handleDragStart = (e, index) => {
    setDraggedSkillIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // store the index as string in dataTransfer as well (belt + suspenders)
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e, categoryName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCategory(categoryName);
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    if (draggedSkillIndex === null) return;

    const draggedSkill = combinedSkills[draggedSkillIndex];
    if (!draggedSkill || draggedSkill.category === targetCategory) {
      setDraggedSkillIndex(null);
      setDragOverCategory(null);
      return;
    }

    // Update category in combinedSkills
    const updated = combinedSkills.map((s, i) =>
      i === draggedSkillIndex ? { ...s, category: targetCategory } : s,
    );
    setCombinedSkills(updated);
    dispatch({ type: "skills/setCombinedSkills", payload: updated });

    // Also update skillMappings category if it's a generated skill
    if (draggedSkill.type === "generated") {
      setSkillMappings((prev) =>
        prev.map((m) =>
          m.skill === draggedSkill.skill
            ? { ...m, category: targetCategory }
            : m,
        ),
      );
    }

    setDraggedSkillIndex(null);
    setDragOverCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedSkillIndex(null);
    setDragOverCategory(null);
  };
  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── JDA wrapper ── */
        .jda-wrap {
          font-family: Inter, system-ui, sans-serif;
        }

        /* ── Textarea ── */
        .jda-textarea {
          width: 100%;
          min-height: 160px;
          resize: vertical;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          padding: 12px 14px;
          font-size: 13px;
          line-height: 1.6;
          color: #1e293b;
          background: #f8fafc;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
        }
        .jda-textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
          background: #fff;
        }
        .jda-textarea::placeholder { color: #94a3b8; }

        /* ── Analyze button ── */
        .jda-btn {
          width: 100%;
          padding: 11px 0;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .jda-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .jda-btn:not(:disabled):hover { opacity: 0.92; }

        /* ── Helper text ── */
        .jda-hint {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 6px;
        }

        /* ── Skills section ── */
        .jda-skills-header {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 14px;
          margin-top: 18px;
        }

        /* ── Skills grid ── */
        .jda-skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 8px;
          margin-bottom: 16px;
        }

        /* ── Skill chip ── */
        .jda-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          border-radius: 10px;
          padding: 6px 8px;
          border: 1px solid;
          position: relative;
          transition: box-shadow 0.12s;
        }
        .jda-chip:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .jda-chip.generated {
          background: #f5f3ff;
          border-color: #c4b5fd;
        }
        .jda-chip.custom {
          background: #f0fdf4;
          border-color: #86efac;
        }

        /* ── Skill text input ── */
        .jda-skill-input {
          flex: 1;
          min-width: 0;
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 4px 8px;
          outline: none;
          transition: border-color 0.12s;
          height: 30px;
        }
        .jda-skill-input:focus { border-color: #6366f1; }
        .jda-skill-input::placeholder { color: #94a3b8; font-weight: 400; }

        /* ── Chip action buttons ── */
        .jda-chip-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1px solid;
          background: #fff;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s;
        }
        .jda-chip-btn.save  { border-color: #86efac; color: #16a34a; }
        .jda-chip-btn.save:hover { background: #f0fdf4; }
        .jda-chip-btn.del   { border-color: #fca5a5; color: #ef4444; }
        .jda-chip-btn.del:hover { background: #fef2f2; }
        .jda-chip-btn.map   { border-color: #93c5fd; color: #3b82f6; }
        .jda-chip-btn.map:hover, .jda-chip-btn.map.active { background: #eff6ff; }
        .jda-chip-btn.map.active { color: #f97316; border-color: #f97316; }

        /* ── Mapping dropdown ── */
        .jda-dropdown {
          position: absolute;
          z-index: 9999;
          background: #1e293b;
          color: #f1f5f9;
          border-radius: 10px;
          padding: 12px;
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
          min-width: 210px;
          top: calc(100% + 6px);
          left: 0;
          border: 1px solid #334155;
        }
        .jda-dropdown-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
          margin-bottom: 8px;
        }
        .jda-dropdown-scroll {
          max-height: 180px;
          overflow-y: auto;
        }
        .jda-dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 0;
          font-size: 12px;
        }
        .jda-dropdown-item label { cursor: pointer; }

        /* ── Add skill button ── */
        .jda-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
          margin-top: 4px;
        }
        .jda-add-btn:hover { opacity: 0.9; }

        /* ── Type badge ── */
        .jda-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 2px 5px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .jda-badge.generated { background: #ede9fe; color: #7c3aed; }
        .jda-badge.custom    { background: #dcfce7; color: #15803d; }


        .ro-tooltip {
  position: relative;
}
.ro-tooltip:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #f1f5f9;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 9px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.ro-tooltip:hover::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1e293b;
  z-index: 100;
  pointer-events: none;
}
      `}</style>

      <div className="jda-wrap">
        {/* ── Textarea ── */}
        <textarea
          className="jda-textarea"
          placeholder="Paste job description here… e.g. 8+ years experience in modern frontend, strong TypeScript & React skills, AWS familiarity…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        {/* ── Analyze button ── */}
        <button
          className="jda-btn"
          style={{ margin: "10px 0 4px" }}
          onClick={analyzeJobDescription}
          disabled={isAnalyzing || !jobDescription.trim()}
        >
          {isAnalyzing ? (
            <>
              <Spinner className="w-4 h-4 border-2" />
              Analyzing…
            </>
          ) : (
            "Analyze Job Description"
          )}
        </button>
        <p className="jda-hint">
          Extracts required skills, experience level, and role details from the
          pasted JD.
        </p>

        {/* ── Skills panel (shown after analysis) ── */}
        <p className="px-5 pt-5 pb-2">
          <StepLabel
            number="3"
            icon="✨"
            title="Step 3: Align Skills to Experiences"
          />
          <p className="text-xs text-gray-500 mb-3 -mt-1 ml-9">
            Tool extracted a custom set of core technical competencies. Map
            these skills to the roles in your profile. Bullet points for each
            experience will prioritize mapped technologies.
          </p>
        </p>
        {analysis && (
          <div>
            <p className="jda-skills-header">
              Technical Skills — {combinedSkills.length} found
            </p>

            {(() => {
              const groups = {};
              const order = [];
              combinedSkills.forEach((skillObj, index) => {
                const cat = skillObj.category || "Other";
                if (!groups[cat]) {
                  groups[cat] = [];
                  order.push(cat);
                }
                groups[cat].push({ skillObj, index });
              });

              return (
                <div style={{ marginBottom: 16 }}>
                  {order.map((categoryName) => (
                    <div
                      key={categoryName}
                      style={{ marginBottom: 12 }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverCategory(categoryName);
                      }}
                      onDrop={(e) => handleDrop(e, categoryName)}
                      onDragLeave={() => setDragOverCategory(null)}
                    >
                      {/* Category label row — IDENTICAL to compact view */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <JDACategoryInput
                          categoryName={categoryName}
                          combinedSkills={combinedSkills}
                          onRename={(oldCat, newCat) => {
                            const updated = combinedSkills.map((s) =>
                              s.category === oldCat
                                ? { ...s, category: newCat }
                                : s,
                            );
                            setCombinedSkills(updated);
                            dispatch({
                              type: "skills/setCombinedSkills",
                              payload: updated,
                            });
                            setSkillMappings((prev) =>
                              prev.map((m) =>
                                m.category === oldCat
                                  ? { ...m, category: newCat }
                                  : m,
                              ),
                            );
                          }}
                          isDragOver={dragOverCategory === categoryName}
                        />
                        {/* Delete entire category */}
                        <button
                          onClick={() => {
                            const updated = combinedSkills.filter(
                              (s) => s.category !== categoryName,
                            );
                            setCombinedSkills(updated);
                            dispatch({
                              type: "skills/setCombinedSkills",
                              payload: updated,
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#cbd5e1",
                            fontSize: 11,
                            padding: 0,
                            lineHeight: 1,
                          }}
                          title="Remove this category and all its skills"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Skills chips — IDENTICAL style to compact view */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          paddingLeft: 4,
                        }}
                      >
                        {groups[categoryName].map(({ skillObj, index }) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={(e) => {
                              setDraggedSkillIndex(index);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => {
                              setDraggedSkillIndex(null);
                              setDragOverCategory(null);
                            }}
                            data-compact-dropdown=""
                            style={{
                              position: "relative",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              background:
                                draggedSkillIndex === index
                                  ? "rgba(99,102,241,0.10)"
                                  : skillObj.type === "custom"
                                    ? "#f0fdf4"
                                    : "#eef2ff",
                              border: `1px solid ${
                                draggedSkillIndex === index
                                  ? "#6366f1"
                                  : skillObj.type === "custom"
                                    ? "#86efac"
                                    : "#c7d2fe"
                              }`,
                              borderRadius: 6,
                              padding: "3px 8px",
                              opacity: draggedSkillIndex === index ? 0.45 : 1,
                              cursor: "grab",
                              userSelect: "none",
                              transition: "opacity 0.15s",
                            }}
                          >
                            {/* Editable skill name — same as SkillInput */}
                            <JDASkillInput
                              value={skillObj.skill}
                              onSave={(newVal) =>
                                handleSkillChange(newVal, index)
                              }
                            />

                            {/* Save to master — only for JD-generated skills */}
                            {skillObj.type === "generated" && (
                              <button
                                title="Save to Master Profile"
                                onClick={() =>
                                  handleSaveToCustomSkills(skillObj.skill)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#16a34a",
                                  padding: 0,
                                  lineHeight: 1,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <PlusCircle size={11} />
                              </button>
                            )}

                            {/* Map ⇄ */}
                            <button
                              title="Map to experience"
                              onClick={() => handleDropdownToggle(index)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color:
                                  openDropdown === index
                                    ? "#f97316"
                                    : "#6366f1",
                                fontSize: 12,
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              ⇄
                            </button>

                            {/* Delete ✕ */}
                            <button
                              title="Remove"
                              onClick={() =>
                                skillObj.type === "custom"
                                  ? handleDeleteCustomSkill(skillObj.skill)
                                  : handleRemoveSkill(index)
                              }
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#a5b4fc",
                                fontSize: 12,
                                padding: 0,
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>

                            {/* Mapping dropdown */}
                            {openDropdown === index && (
                              <div
                                ref={dropdownRef}
                                style={{
                                  position: "absolute",
                                  zIndex: 9999,
                                  background: "#1e293b",
                                  color: "#f1f5f9",
                                  borderRadius: 10,
                                  padding: 12,
                                  boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
                                  minWidth: 200,
                                  top: "calc(100% + 6px)",
                                  left: 0,
                                  border: "1px solid #334155",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    color: "#64748b",
                                    marginBottom: 8,
                                  }}
                                >
                                  Map to experience
                                </p>
                                <div
                                  style={{ maxHeight: 180, overflowY: "auto" }}
                                >
                                  {userDetails.experience.map((exp, i) => {
                                    const isLocked =
                                      exp.responsibilityType === "none";
                                    const isTitleBased =
                                      exp.responsibilityType === "titleBased";
                                    const isDisabled = isTitleBased || isLocked;
                                    const inputId = `jda-mapping-${index}-${i}`;
                                    const isMapped =
                                      skillObj.type === "custom"
                                        ? userDetails.customSkills
                                            .find(
                                              (cs) =>
                                                cs.skill === skillObj.skill,
                                            )
                                            ?.experienceMappings?.includes(i)
                                        : skillMappings
                                            .find(
                                              (m) => m.skill === skillObj.skill,
                                            )
                                            ?.experienceMappings?.includes(i);
                                    return (
                                      <div
                                        key={i}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                          padding: "4px 0",
                                          fontSize: 12,
                                          opacity: isDisabled ? 0.4 : 1,
                                        }}
                                      >
                                        <input
                                          id={inputId}
                                          type="checkbox"
                                          checked={isMapped || false}
                                          disabled={isDisabled}
                                          onChange={(e) =>
                                            handleSkillMappingChange(
                                              skillObj.skill,
                                              i,
                                              e.target.checked,
                                              skillObj.type === "custom",
                                            )
                                          }
                                        />
                                        <label
                                          htmlFor={inputId}
                                          style={{
                                            cursor: isDisabled
                                              ? "not-allowed"
                                              : "pointer",
                                          }}
                                        >
                                          {exp.title}
                                          {isLocked && (
                                            <span
                                              style={{
                                                color: "#64748b",
                                                marginLeft: 4,
                                              }}
                                            >
                                              (Locked)
                                            </span>
                                          )}
                                          {isTitleBased && !isLocked && (
                                            <span
                                              style={{
                                                color: "#64748b",
                                                marginLeft: 4,
                                              }}
                                            >
                                              (Title-based)
                                            </span>
                                          )}
                                        </label>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* + add skill to this category */}
                        <button
                          onClick={() => {
                            const newObj = {
                              skill: "",
                              category: categoryName,
                              experienceMappings:
                                userDetails.experience?.map((_, i) => i) || [],
                              type: "generated",
                              _fromJD: true,
                            };
                            const updated = [...combinedSkills, newObj];
                            setCombinedSkills(updated);
                            dispatch({
                              type: "skills/setCombinedSkills",
                              payload: updated,
                            });
                            setSkillMappings((prev) => [
                              ...prev,
                              {
                                skill: "",
                                category: categoryName,
                                experienceMappings:
                                  userDetails.experience?.map((_, i) => i) ||
                                  [],
                              },
                            ]);
                            // setAnalysis((prev) =>
                            //   prev
                            //     ? {
                            //         ...prev,
                            //         technicalSkills: [
                            //           ...(prev.technicalSkills || []),
                            //           "",
                            //         ],
                            //       }
                            //     : prev,
                            // );
                          }}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#6366f1",
                            background: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            borderRadius: 6,
                            padding: "3px 8px",
                            cursor: "pointer",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add new category — identical to compact view */}
                  <button
                    onClick={() => {
                      const newCat = "New Category";
                      const newObj = {
                        skill: "",
                        category: newCat,
                        experienceMappings:
                          userDetails.experience?.map((_, i) => i) || [],
                        type: "generated",
                        _fromJD: true,
                      };
                      const updated = [...combinedSkills, newObj];
                      setCombinedSkills(updated);
                      dispatch({
                        type: "skills/setCombinedSkills",
                        payload: updated,
                      });
                      setSkillMappings((prev) => [
                        ...prev,
                        {
                          skill: "",
                          category: newCat,
                          experienceMappings:
                            userDetails.experience?.map((_, i) => i) || [],
                        },
                      ]);
                      // setAnalysis((prev) =>
                      //   prev
                      //     ? {
                      //         ...prev,
                      //         technicalSkills: [
                      //           ...(prev.technicalSkills || []),
                      //           "",
                      //         ],
                      //       }
                      //     : prev,
                      // );
                    }}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6366f1",
                      background: "#eef2ff",
                      border: "1px solid #c7d2fe",
                      borderRadius: 6,
                      padding: "4px 10px",
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    + Add Category
                  </button>
                </div>
              );
            })()}

            <button className="jda-add-btn" onClick={handleAddSkill}>
              <PlusCircle size={13} />
              Add Skill
            </button>
          </div>
        )}
      </div>
    </>
  );
}
