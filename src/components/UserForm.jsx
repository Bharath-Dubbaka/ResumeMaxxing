"use client";
import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { PlusCircle, Save, Trash2, X, MapIcon, DotIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Spinner } from "../components/ui/spinner";
import { toast, Toaster } from "sonner";
import { Accordion, AccordionItem } from "../components/Accordion";
import MiniPreview from './MiniPreview';

const UserForm = ({ onSave, onCancel, initialData, isEditing }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        customSkills: initialData.customSkills || []
      };
    }
    return {
      fullName: "",
      email: "",
      phone: "",
      experience: [],
      education: [],
      certifications: [],
      projects: [],
      customSkills: [],
    };
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const handleChange = (field, value) => {
    if (field === 'experience') {
      // Check for title changes
      const titleChanges = value.map((exp, index) => ({
        oldTitle: userDetails.experience[index]?.title,
        newTitle: exp.title,
        changed: exp.title !== userDetails.experience[index]?.title
      })).filter(change => change.changed);

      // Update skill mappings if titles changed
      if (titleChanges.length > 0) {
        const updatedCustomSkills = userDetails.customSkills?.map(skill => ({
          ...skill,
          experienceMappings: skill.experienceMappings.map(title => {
            const change = titleChanges.find(c => c.oldTitle === title);
            return change ? change.newTitle : title;
          })
        }));

        setUserDetails(prev => ({
          ...prev,
          experience: value,
          customSkills: updatedCustomSkills
        }));
        return;
      }
    }
    
    setUserDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date, field, index, section) => {
    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const formattedDate = `${year}-${month.toString().padStart(2, "0")}`;

      handleChange(section, [
        ...userDetails[section].slice(0, index),
        {
          ...userDetails[section][index],
          [field]: formattedDate,
        },
        ...userDetails[section].slice(index + 1),
      ]);
    }
  };

  const handleAddField = (field, value) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value],
    }));
  };

  const handleRemoveField = (field, index) => {
    setUserDetails((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleAddCustomSkill = () => {
    setUserDetails(prev => ({
      ...prev,
      customSkills: [...(prev.customSkills || []), {
        skill: "",
        experienceMappings: prev.experience?.map(exp => exp.title) || []
      }]
    }));
  };

  const handleRemoveCustomSkill = (index) => {
    setUserDetails(prev => ({
      ...prev,
      customSkills: prev?.customSkills?.filter((_, i) => i !== index)
    }));
  };

  const handleCustomSkillChange = (index, newSkill) => {
    setUserDetails(prev => ({
      ...prev,
      customSkills: prev?.customSkills?.map((skill, i) => 
        i === index ? { ...skill, skill: newSkill } : skill
      )
    }));
  };

  const handleSkillMappingChange = (skillIndex, expTitle, checked) => {
    setUserDetails(prev => ({
      ...prev,
      customSkills: prev?.customSkills?.map((skillItem, i) => 
        i === skillIndex ? {
          ...skillItem,
          experienceMappings: checked 
            ? [...skillItem.experienceMappings, expTitle]
            : skillItem.experienceMappings.filter(title => title !== expTitle)
        } : skillItem
      )
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave({ ...userDetails });
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Failed to save user details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex space-evenly">
      {/* Mini Preview */}
      <MiniPreview userDetails={userDetails} />

      {/* Main Form */}
      <div className="min-w-6xl mx-auto rounded-xl py-10 bg-gradient-to-br from-teal-50/95 via-blue-50 to-pink-200/60 animate-gradient-xy backdrop-blur-sm shadow-xl border border-white/10">
        <div className="max-w-5xl mx-auto px-10">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="text-2xl font-semibold mb-6">
              Master Resume Builder
            </div>

            <Accordion>
              {/* Personal Details Section */}
              <AccordionItem
                value="personal"
                trigger="Contact Details:"
                defaultOpen={true}
                className="bg-white/90 shadow-lg border-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      className="h-10 font-sans text-base hover:border-gray-800"
                      value={userDetails.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input
                      className="h-10 font-sans text-base hover:border-gray-800"
                      type="email"
                      value={userDetails.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Phone
                    </Label>
                    <Input
                      className="h-10 font-sans text-base hover:border-gray-800"
                      value={userDetails.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </AccordionItem>

              {/* Experience Section */}
              <AccordionItem
                value="experience"
                trigger="Experience:"
                className="bg-white/90 shadow-lg border-0"
              >
                <div className="space-y-6">
                  
                  {userDetails.experience.map((exp, index) => (
                    < div key={index}>
                    <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold ">
                      Experience {index + 1}
                    </h4>
                    <button
                            onClick={() => handleRemoveField("experience", index)}
                            className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                    <Card key={index} className="border shadow-sm">
                      <CardContent className="p-6">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Job Title
                            </Label>
                            <Input
                              className="h-10 font-sans text-base hover:border-gray-800"
                              value={exp.title}
                              onChange={(e) =>
                                handleChange("experience", [
                                  ...userDetails.experience.slice(0, index),
                                  { ...exp, title: e.target.value },
                                  ...userDetails.experience.slice(index + 1),
                                ])
                              }
                              placeholder="Enter job title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Employer
                            </Label>
                            <Input
                              className="h-10 font-sans text-base hover:border-gray-800"
                              value={exp.employer}
                              onChange={(e) =>
                                handleChange("experience", [
                                  ...userDetails.experience.slice(0, index),
                                  {
                                    ...exp,
                                    employer: e.target.value,
                                  },
                                  ...userDetails.experience.slice(index + 1),
                                ])
                              }
                              placeholder="Enter employer"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Start Date
                            </Label>
                            <DatePicker
                              selected={
                                isValidDate(exp.startDate)
                                  ? new Date(exp.startDate)
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "startDate",
                                  index,
                                  "experience"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              className="w-full h-10 rounded-md border border-input hover:border-gray-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              End Date
                            </Label>
                            <DatePicker
                              selected={
                                isValidDate(exp.endDate)
                                  ? new Date(exp.endDate)
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "endDate",
                                  index,
                                  "experience"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              className="w-full h-10 rounded-md border border-input hover:border-gray-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 ">
                              Location
                            </Label>
                            <Input
                              className="h-10 font-sans text-base hover:border-gray-800"
                              value={exp.location}
                              onChange={(e) =>
                                handleChange("experience", [
                                  ...userDetails.experience.slice(0, index),
                                  {
                                    ...exp,
                                    location: e.target.value,
                                  },
                                  ...userDetails.experience.slice(index + 1),
                                ])
                              }
                              placeholder="Enter location"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Label className="text-sm font-medium text-gray-700">
                              Generate responsibilities based on:
                            </Label>
                            <Select
                              value={exp.responsibilityType}
                              onValueChange={(value) =>
                                handleChange("experience", [
                                  ...userDetails.experience.slice(0, index),
                                  {
                                    ...exp,
                                    responsibilityType: value,
                                  },
                                  ...userDetails.experience.slice(index + 1),
                                ])
                              }
                            >
                              <SelectTrigger className="w-[180px] h-10 text-orange-900 border border-orange-900">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="skillBased">
                                  Current Skills
                                </SelectItem>
                                <SelectItem value="titleBased">
                                  Role Title
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Custom Responsibilities:
                            </Label>
                            <div className="space-y-2">
                              {exp.customResponsibilities?.map(
                                (resp, respIndex) => (
                                  <div key={respIndex} className="flex gap-2 items-center">
                                    <DotIcon className="w-4 h-4" />
                                    <Input
                                      className="h-11 px-4 border-gray-200 hover:border-gray-800 focus:border-indigo-500 transition-colors"
                                      value={resp}
                                      onChange={(e) => {
                                        const newResponsibilities = [
                                          ...(exp.customResponsibilities || []),
                                        ];
                                        newResponsibilities[respIndex] =
                                          e.target.value;
                                        handleChange("experience", [
                                          ...userDetails.experience.slice(
                                            0,
                                            index
                                          ),
                                          {
                                            ...exp,
                                            customResponsibilities:
                                              newResponsibilities,
                                          },
                                          ...userDetails.experience.slice(
                                            index + 1
                                          ),
                                        ]);
                                      }}
                                      placeholder="Enter responsibility"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => {
                                        const newResponsibilities =
                                          exp.customResponsibilities.filter(
                                            (_, i) => i !== respIndex
                                          );
                                        handleChange("experience", [
                                          ...userDetails.experience.slice(
                                            0,
                                            index
                                          ),
                                          {
                                            ...exp,
                                            customResponsibilities:
                                              newResponsibilities,
                                          },
                                          ...userDetails.experience.slice(
                                            index + 1
                                          ),
                                        ]);
                                      }}
                                    >
                                      <X className="h-6 w-6" />
                                    </Button>
                                  </div>
                                )
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  handleChange("experience", [
                                    ...userDetails.experience.slice(0, index),
                                    {
                                      ...exp,
                                      customResponsibilities: [
                                        ...(exp.customResponsibilities || []),
                                        "",
                                      ],
                                    },
                                    ...userDetails.experience.slice(index + 1),
                                  ]);
                                }}
                                className="text-blue-900 border border-blue-950"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Responsibility
                              </Button>
                            </div>
                          </div>

                          {/* <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleRemoveField("experience", index)}
                            className="mt-6"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Experience
                          </Button> */}
                        </div>
                      </CardContent>
                    </Card>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() =>
                        handleAddField("experience", {
                          title: "",
                          employer: "",
                          startDate: "",
                          endDate: "",
                          location: "",
                          customResponsibilities: [],
                          responsibilityType: "skillBased",
                        })
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                </div>
              </AccordionItem>

              {/* Custom Skills Section */}
              <AccordionItem
                value="customSkills"
                trigger="Custom Skills:"
                className="bg-white/90 shadow-lg border-0"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-5 justify-start">
                    {userDetails?.customSkills?.map((skillItem, index) => (
                      <div
                        key={index}
                        className="w-[23%] group relative border border-slate-200 py-2 px-3 bg-purple-50 rounded-xl"
                      >
                        <div className="relative flex items-center gap-1">
                          <input
                            type="text"
                            value={skillItem.skill}
                            onChange={(e) => handleCustomSkillChange(index, e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white text-black font-medium rounded-lg border border-slate-400 focus:border-blue-200 focus:ring-1 focus:ring-blue-300 outline-none transition-all duration-200 hover:bg-teal-50"
                            placeholder="Enter skill"
                            title="Edit Skill"
                          />
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                            title="Map Skill to Experience"
                            className={`p-2 bg-white text-blue-400 rounded-lg border border-blue-600 hover:bg-blue-100 transition-all duration-200 ${
                              openDropdown === index ? "bg-blue-600 text-orange-400" : ""
                            }`}
                          > 
                            <MapIcon size={16} />
                          </button>
                          {openDropdown === index && (
                            <div
                              ref={dropdownRef}
                              className="w-full absolute top-12 left-0 z-50 bg-slate-800 text-white rounded-lg shadow-lg p-4 border border-slate-700 space-y-2"
                            >
                              <h4 className="font-bold text-sm mb-2">Map Skill to:</h4>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {userDetails.experience?.map((exp, i) => {
                                  const isTitleBased = exp.responsibilityType === "titleBased";
                                  return (
                                    <div
                                      key={i}
                                      className={`flex items-center gap-2 ${
                                        isTitleBased ? "opacity-50" : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`mapping-${index}-${i}`}
                                        checked={skillItem.experienceMappings.includes(exp.title)}
                                        disabled={isTitleBased}
                                        onChange={(e) =>
                                          handleSkillMappingChange(
                                            index,
                                            exp.title,
                                            e.target.checked
                                          )
                                        }
                                        className={`rounded border-slate-500 text-blue-500 focus:ring-blue-500 ${
                                          isTitleBased ? "cursor-not-allowed" : ""
                                        }`}
                                      />
                                      <label
                                        htmlFor={`mapping-${index}-${i}`}
                                        className={`text-sm ${
                                          isTitleBased ? "cursor-not-allowed" : "cursor-pointer"
                                        }`}
                                      >
                                        {exp.title}
                                        {isTitleBased && (
                                          <span className="ml-1 text-slate-400">
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
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSkill(index)}
                            title="Remove Skill"
                            className="p-2 bg-white text-rose-400 rounded-lg border border-red-600 hover:bg-red-200 transition-all duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Button
                      type="button"
                      onClick={handleAddCustomSkill}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg"
                    >
                      <PlusCircle size={16} />
                      Add New Skill
                    </Button>
                  </div>
                </div>
              </AccordionItem>

              {/* Education Section */}
              <AccordionItem
                value="education"
                trigger="Education:"
                className="bg-white/90 shadow-lg border-0"
              >
                <div className="space-y-6">

                  {userDetails.education.map((edu, index) => ( 
                    < div key={index}>
                    <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold ">
                      Education {index + 1}
                    </h4>
                    <button
                          onClick={() => handleRemoveField("education", index)}
                          className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                    <Card key={index} className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Degree
                            </Label>
                            <Input
                              className="h-10 font-sans text-base hover:border-gray-800"
                              value={edu.degree}
                              onChange={(e) =>
                                handleChange("education", [
                                  ...userDetails.education.slice(0, index),
                                  { ...edu, degree: e.target.value },
                                  ...userDetails.education.slice(index + 1),
                                ])
                              }
                              placeholder="Enter degree/course"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Institution
                            </Label>
                            <Input
                              className="h-10 font-sans text-base hover:border-gray-800"
                              value={edu.institution}
                              onChange={(e) =>
                                handleChange("education", [
                                  ...userDetails.education.slice(0, index),
                                  {
                                    ...edu,
                                    institution: e.target.value,
                                  },
                                  ...userDetails.education.slice(index + 1),
                                ])
                              }
                              placeholder="Enter institution name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 ">
                              Start Date
                            </Label>
                            <DatePicker
                              selected={
                                isValidDate(edu.startDate)
                                  ? new Date(edu.startDate)
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "startDate",
                                  index,
                                  "education"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              className="w-full h-10 rounded-md border border-input hover:border-gray-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              End Date
                            </Label>
                            <DatePicker
                              selected={
                                isValidDate(edu.endDate)
                                  ? new Date(edu.endDate)
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "endDate",
                                  index,
                                  "education"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              className="w-full h-10 rounded-md border border-input hover:border-gray-800"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Grade/GPA
                            </Label>
                            <Input
                              className="h-10 hover:border-gray-800"
                              value={edu.grade}
                              onChange={(e) =>
                                handleChange("education", [
                                  ...userDetails.education.slice(0, index),
                                  { ...edu, grade: e.target.value },
                                  ...userDetails.education.slice(index + 1),
                                ])
                              }
                              placeholder="Enter grade/GPA"
                            />
                          </div>
                        </div>

                        {/* <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleRemoveField("education", index)}
                          className="mt-6"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Education
                        </Button> */}
                      </CardContent>
                    </Card>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() =>
                        handleAddField("education", {
                          institution: "",
                          degree: "",
                          field: "",
                          startDate: "",
                          endDate: "",
                          location: "",
                        })
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Education
                    </Button>
                  </div>
                </div>
              </AccordionItem>

              {/* Certifications Section */}
              <AccordionItem
                value="certifications"
                trigger="Certifications:"
                className="bg-white/90 shadow-lg border-0"
              >
                {userDetails.certifications.map((cert, index) => (
                  <div key={index}  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold ">
                        Certification {index + 1}
                      </h4>
                      <button
                        onClick={() => handleRemoveField("certifications", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                    <Card key={index} className="border shadow-sm mb-4 ">
                      <CardContent className="p-6 ">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={cert.name}
                              onChange={(e) =>
                                handleChange("certifications", [
                                  ...userDetails.certifications.slice(0, index),
                                  {
                                    ...cert,
                                    name: e.target.value,
                                  },
                                  ...userDetails.certifications.slice(index + 1),
                                ])
                              }
                              placeholder="e.g., AWS Solutions Architect"
                            />
                          </div>
                          <div>
                            <Label>Issuer</Label>
                            <Input
                              value={cert.issuer}
                              onChange={(e) =>
                                handleChange("certifications", [
                                  ...userDetails.certifications.slice(0, index),
                                  {
                                    ...cert,
                                    issuer: e.target.value,
                                  },
                                  ...userDetails.certifications.slice(index + 1),
                                ])
                              }
                              placeholder="e.g., Amazon Web Services"
                            />
                          </div>
                          <div>
                            <Label>Issue Date</Label>
                            <DatePicker
                              selected={
                                cert.issueDate
                                  ? new Date(cert.issueDate + "-01")
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "issueDate",
                                  index,
                                  "certifications"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              placeholderText="Select date"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <Label>Expiry Date (Optional)</Label>
                            <DatePicker
                              selected={
                                cert.expiryDate
                                  ? new Date(cert.expiryDate + "-01")
                                  : null
                              }
                              onChange={(date) =>
                                handleDateChange(
                                  date,
                                  "expiryDate",
                                  index,
                                  "certifications"
                                )
                              }
                              dateFormat="MM/yyyy"
                              showMonthYearPicker
                              placeholderText="Select date"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddField("certifications", {
                        name: "",
                        issuer: "",
                        issueDate: "",
                        expiryDate: "",
                      })
                    }
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
              </AccordionItem>

              {/* Projects Section */}
              <AccordionItem
                value="projects"
                trigger="Projects:"
                className="bg-white/90 shadow-lg border-0"
              >
                <div className="space-y-6">
                  {userDetails.projects.map((project, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold">
                          Project {index + 1}
                        </h4>
                        <button
                          onClick={() => handleRemoveField("projects", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-8 h-8" />
                        </button>
                      </div>
                      <Card key={index} className="border shadow-sm">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Project Name
                              </Label>
                              <Input
                                className="h-10"
                                value={project.name}
                                onChange={(e) =>
                                  handleChange("projects", [
                                    ...userDetails.projects.slice(0, index),
                                    {
                                      ...project,
                                      name: e.target.value,
                                    },
                                    ...userDetails.projects.slice(index + 1),
                                  ])
                                }
                                placeholder="Enter project name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Technologies Used
                              </Label>
                              <Input
                                className="h-10"
                                value={project.technologies}
                                onChange={(e) =>
                                  handleChange("projects", [
                                    ...userDetails.projects.slice(0, index),
                                    {
                                      ...project,
                                      technologies: e.target.value,
                                    },
                                    ...userDetails.projects.slice(index + 1),
                                  ])
                                }
                                placeholder="Enter technologies used"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-6">
                            <Label className="text-sm font-medium text-gray-700">
                              Description
                            </Label>
                            <Input
                              className="h-10"
                              value={project.description}
                              onChange={(e) =>
                                handleChange("projects", [
                                  ...userDetails.projects.slice(0, index),
                                  {
                                    ...project,
                                    description: e.target.value,
                                  },
                                  ...userDetails.projects.slice(index + 1),
                                ])
                              }
                              placeholder="Enter project description"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Start Date
                              </Label>
                              <DatePicker
                                selected={
                                  isValidDate(project.startDate)
                                    ? new Date(project.startDate)
                                    : null
                                }
                                onChange={(date) =>
                                  handleDateChange(
                                    date,
                                    "startDate",
                                    index,
                                    "projects"
                                  )
                                }
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                className="w-full h-10 rounded-md border border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                End Date
                              </Label>
                              <DatePicker
                                selected={
                                  isValidDate(project.endDate)
                                    ? new Date(project.endDate)
                                    : null
                                }
                                onChange={(date) =>
                                  handleDateChange(
                                    date,
                                    "endDate",
                                    index,
                                    "projects"
                                  )
                                }
                                dateFormat="MM/yyyy"
                                showMonthYearPicker
                                className="w-full h-10 rounded-md border border-input"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">
                                Project Link
                              </Label>
                              <Input
                                className="h-10"
                                value={project.link}
                                onChange={(e) =>
                                  handleChange("projects", [
                                    ...userDetails.projects.slice(0, index),
                                    {
                                      ...project,
                                      link: e.target.value,
                                    },
                                    ...userDetails.projects.slice(index + 1),
                                  ])
                                }
                                placeholder="Enter project link"
                              />
                            </div>
                          </div>
                          {/* 
                                   <Button
                                      type="button"
                                      variant="destructive"
                                      onClick={() =>
                                         handleRemoveField("projects", index)
                                      }
                                      className="mt-6"
                                   >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove Project
                                   </Button> */}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() =>
                        handleAddField("projects", {
                          name: "",
                          description: "",
                          technologies: "",
                          startDate: "",
                          endDate: "",
                          link: "",
                        })
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Project
                    </Button>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>

            {/* Form Actions */}
            <div className="sticky bottom-0 py-4 bg-white/80 backdrop-blur-xl border-t shadow-lg">
              <div className="max-w-4xl mx-auto px-4 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-6 text-white"
                >
                  <X className="mr-2 h-4 w-4 " />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="p-6 bg-gradient-to-br from-purple-600  to-indigo-500  hover:from-indigo-500 hover:to-purple-500 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4 border-2 mr-2" />
                      <p className="text-pink-600 font-medium">Saving...</p>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Details
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
