import React, { useState, useEffect } from "react";
import { Download, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { toast, Toaster } from "sonner";
import { BNPPreview } from "../components/previews/BNPpreview";
import { StateOfMSPreview } from "./previews/StateOfMSpreview";
import { TemplateSelector } from "./TemplateSelector";
import { ModernCleanPreview } from "./previews/ModernCleanPreview";

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
  downloadAsWord,
  refresh,
  loading,
  onSaveCustomResponsibility,
  userDetails,
  isEditing: initialIsEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [resumeData, setResumeData] = useState(null);
  const [savedResponsibilities, setSavedResponsibilities] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState("BNP");

  const getPreviewComponent = (template) => {
    switch (template) {
      case "BNP":
        return BNPPreview;
      case "StateOfMS":
        return StateOfMSPreview;
      case "ModernClean":
        return ModernCleanPreview;
      default:
        return BNPPreview;
    }
  };

  const PreviewComponent = getPreviewComponent(selectedTemplate);

  useEffect(() => {
    const newResumeData =
      typeof initialResumeContent === "string"
        ? JSON.parse(initialResumeContent)
        : initialResumeContent;

    setResumeData(newResumeData);

    const savedMap = {};
    userDetails?.experience?.forEach((exp, expIndex) => {
      exp.customResponsibilities?.forEach((resp) => {
        savedMap[`${expIndex}-${resp}`] = true;
      });
    });
    setSavedResponsibilities(savedMap);
  }, [initialResumeContent, refresh, userDetails]);

  const handleEdit = (field, value) => {
    const updatedData = {
      ...resumeData,
      [field]: value,
    };
    setResumeData(updatedData);
    try {
      const jsonString = JSON.stringify(updatedData);
      onUpdate(jsonString);
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

  const handleSaveToCustom = async (expIndex, responsibility) => {
    if (savedResponsibilities[`${expIndex}-${responsibility}`]) {
      console.log("This responsibility is already saved!");
      toast.error("This responsibility is already saved!");
      return;
    }

    try {
      await onSaveCustomResponsibility(expIndex, responsibility);

      setSavedResponsibilities((prev) => ({
        ...prev,
        [`${expIndex}-${responsibility}`]: true,
      }));
      // Show success message
      console.log("Responsibility saved successfully!");
      toast.success("Responsibility saved successfully!");
    } catch (error) {
      console.error("Error saving responsibility:", error);
      console.log("Failed to save responsibility. Please try again.", error);
      toast.error("Failed to save responsibility. Please try again.", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Spinner className="w-16 h-16" />
        <p className="text-lg font-semibold text-blue-600">
          Generating your resume...
        </p>
      </div>
    );
  }

  if (!resumeData) return null;

  return (
    <div className="mt-8">
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
      />

      <div className="bg-white rounded-lg shadow-lg">
        <PreviewComponent
          resumeData={resumeData}
          isEditing={isEditing}
          handleEdit={handleEdit}
          handleExperienceEdit={handleExperienceEdit}
          handleResponsibilityEdit={handleResponsibilityEdit}
          handleAddResponsibility={handleAddResponsibility}
          savedResponsibilities={savedResponsibilities}
          handleSaveToCustom={handleSaveToCustom}
        />
      </div>

      <div className="mt-4 flex justify-end gap-4">
        <Button onClick={() => setIsEditing(!isEditing)} className="mr-2">
          {isEditing ? "Save Changes" : "Edit Resume"}
        </Button>
        <Button
          onClick={() => downloadAsWord(selectedTemplate)}
          disabled={loading}
        >
          Download as Word
        </Button>
      </div>
    </div>
  );
};

export default ResumePreview;
