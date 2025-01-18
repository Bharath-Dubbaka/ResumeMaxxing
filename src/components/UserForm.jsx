"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Save, Trash2, X } from "lucide-react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const UserForm = ({ onSave, onCancel, initialData }) => {
   const [isLoading, setIsLoading] = useState(false);
   const [userDetails, setUserDetails] = useState(() => {
      if (initialData) {
         return initialData;
      }
      return {
         fullName: "",
         email: "",
         phone: "",
         experience: [],
         education: [],
         certifications: [],
         projects: [],
      };
   });

   const isValidDate = (dateString) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
   };

   const handleChange = (field, value) => {
      setUserDetails({ ...userDetails, [field]: value });
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

   const handleAddField = (e, field, value) => {
      e.preventDefault();
      setUserDetails((prev) => ({
         ...prev,
         [field]: [...prev[field], value],
      }));
   };

   const handleRemoveField = (field, index) => {
      setUserDetails((prev) => ({
         ...prev,
         [field]: prev[field].filter((_, i) => i !== index),
      }));
   };

   const handleSave = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
         await onSave(userDetails);
      } catch (error) {
         console.error("Error in handleSave:", error);
         alert("Failed to save user details. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen max-w-5xl mx-auto rounded-xl py-10 bg-teal-100/40 backdrop-blur-sm shadow-xl border border-white/10">
         <div className="max-w-4xl mx-auto px-4">
            <form onSubmit={handleSave} className="space-y-6">
               {/* Personal Details Card */}
               <Card className="bg-white/90 shadow-lg border-0 backdrop-blur-xl rounded-xl">
                  <CardHeader className="border-b bg-white/50 px-6 py-4">
                     <CardTitle className="text-xl font-semibold text-gray-800">
                        Personal Details
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <Label className="text-sm font-medium text-gray-700">
                              Full Name
                           </Label>
                           <Input
                              className="h-10"
                              value={userDetails.fullName}
                              onChange={(e) =>
                                 handleChange("fullName", e.target.value)
                              }
                              placeholder="Enter your full name"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-sm font-medium text-gray-700">
                              Email
                           </Label>
                           <Input
                              className="h-10"
                              type="email"
                              value={userDetails.email}
                              onChange={(e) =>
                                 handleChange("email", e.target.value)
                              }
                              placeholder="Enter your email"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-sm font-medium text-gray-700">
                              Phone
                           </Label>
                           <Input
                              className="h-10"
                              value={userDetails.phone}
                              onChange={(e) =>
                                 handleChange("phone", e.target.value)
                              }
                              placeholder="Enter your phone number"
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Experience Card */}
               <Card className="bg-white/90 shadow-lg border-0 backdrop-blur-xl rounded-xl">
                  <CardHeader className="border-b bg-white/50 px-6 py-4 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-semibold text-gray-800">
                        Work Experience
                     </CardTitle>
                     <Button
                        type="button"
                        onClick={(e) =>
                           handleAddField(e, "experience", {
                              title: "",
                              employer: "",
                              startDate: "",
                              endDate: "",
                              location: "",
                              responsibilityType: "skillBased",
                              customResponsibilities: [],
                           })
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Experience
                     </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     {userDetails.experience.map((exp, index) => (
                        <Card key={index} className="border shadow-sm">
                           <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Job Title
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={exp.title}
                                       onChange={(e) =>
                                          handleChange("experience", [
                                             ...userDetails.experience.slice(
                                                0,
                                                index
                                             ),
                                             { ...exp, title: e.target.value },
                                             ...userDetails.experience.slice(
                                                index + 1
                                             ),
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
                                       className="h-10"
                                       value={exp.employer}
                                       onChange={(e) =>
                                          handleChange("experience", [
                                             ...userDetails.experience.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...exp,
                                                employer: e.target.value,
                                             },
                                             ...userDetails.experience.slice(
                                                index + 1
                                             ),
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
                                       className="w-full h-10 rounded-md border border-input"
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
                                       className="w-full h-10 rounded-md border border-input"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Location
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={exp.location}
                                       onChange={(e) =>
                                          handleChange("experience", [
                                             ...userDetails.experience.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...exp,
                                                location: e.target.value,
                                             },
                                             ...userDetails.experience.slice(
                                                index + 1
                                             ),
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
                                             ...userDetails.experience.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...exp,
                                                responsibilityType: value,
                                             },
                                             ...userDetails.experience.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                    >
                                       <SelectTrigger className="w-[180px] h-10">
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
                                       Custom Responsibilities
                                    </Label>
                                    <div className="space-y-2">
                                       {exp.customResponsibilities?.map(
                                          (resp, respIndex) => (
                                             <div
                                                key={respIndex}
                                                className="flex gap-2"
                                             >
                                                <Input
                                                   className="h-11 px-4 border-gray-200 hover:border-gray-300 focus:border-indigo-500 transition-colors"
                                                   value={resp}
                                                   onChange={(e) => {
                                                      const newResponsibilities =
                                                         [
                                                            ...exp.customResponsibilities,
                                                         ];
                                                      newResponsibilities[
                                                         respIndex
                                                      ] = e.target.value;
                                                      handleChange(
                                                         "experience",
                                                         [
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
                                                         ]
                                                      );
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
                                                            (_, i) =>
                                                               i !== respIndex
                                                         );
                                                      handleChange(
                                                         "experience",
                                                         [
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
                                                         ]
                                                      );
                                                   }}
                                                >
                                                   <X className="h-4 w-4" />
                                                </Button>
                                             </div>
                                          )
                                       )}
                                       <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                             handleChange("experience", [
                                                ...userDetails.experience.slice(
                                                   0,
                                                   index
                                                ),
                                                {
                                                   ...exp,
                                                   customResponsibilities: [
                                                      ...exp.customResponsibilities,
                                                      "",
                                                   ],
                                                },
                                                ...userDetails.experience.slice(
                                                   index + 1
                                                ),
                                             ]);
                                          }}
                                       >
                                          <PlusCircle className="mr-2 h-4 w-4" />
                                          Add Responsibility
                                       </Button>
                                    </div>
                                 </div>

                                 <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() =>
                                       handleRemoveField("experience", index)
                                    }
                                    className="mt-6"
                                 >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Experience
                                 </Button>
                              </div>
                           </CardContent>
                        </Card>
                     ))}
                  </CardContent>
               </Card>

               {/* Education Card */}
               <Card className="bg-white/90 shadow-lg border-0 backdrop-blur-xl rounded-xl">
                  <CardHeader className="border-b bg-white/50 px-6 py-4 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-semibold text-gray-800">
                        Education
                     </CardTitle>
                     <Button
                        type="button"
                        onClick={(e) =>
                           handleAddField(e, "education", {
                              degree: "",
                              institution: "",
                              startDate: "",
                              endDate: "",
                              location: "",
                              grade: "",
                           })
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Education
                     </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     {userDetails.education.map((edu, index) => (
                        <Card key={index} className="border shadow-sm">
                           <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Degree
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={edu.degree}
                                       onChange={(e) =>
                                          handleChange("education", [
                                             ...userDetails.education.slice(
                                                0,
                                                index
                                             ),
                                             { ...edu, degree: e.target.value },
                                             ...userDetails.education.slice(
                                                index + 1
                                             ),
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
                                       className="h-10"
                                       value={edu.institution}
                                       onChange={(e) =>
                                          handleChange("education", [
                                             ...userDetails.education.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...edu,
                                                institution: e.target.value,
                                             },
                                             ...userDetails.education.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter institution name"
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
                                       className="w-full h-10 rounded-md border border-input"
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
                                       className="w-full h-10 rounded-md border border-input"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Grade/GPA
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={edu.grade}
                                       onChange={(e) =>
                                          handleChange("education", [
                                             ...userDetails.education.slice(
                                                0,
                                                index
                                             ),
                                             { ...edu, grade: e.target.value },
                                             ...userDetails.education.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter grade/GPA"
                                    />
                                 </div>
                              </div>

                              <Button
                                 type="button"
                                 variant="destructive"
                                 onClick={() =>
                                    handleRemoveField("education", index)
                                 }
                                 className="mt-6"
                              >
                                 <Trash2 className="mr-2 h-4 w-4" />
                                 Remove Education
                              </Button>
                           </CardContent>
                        </Card>
                     ))}
                  </CardContent>
               </Card>

               {/* Certifications Card */}
               <Card className="bg-white/90 shadow-lg border-0 backdrop-blur-xl rounded-xl">
                  <CardHeader className="border-b bg-white/50 px-6 py-4 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-semibold text-gray-800">
                        Certifications
                     </CardTitle>
                     <Button
                        type="button"
                        onClick={(e) =>
                           handleAddField(e, "certifications", {
                              name: "",
                              issuer: "",
                              date: "",
                              expiryDate: "",
                              credentialId: "",
                           })
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Certification
                     </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     {userDetails.certifications.map((cert, index) => (
                        <Card key={index} className="border shadow-sm">
                           <CardContent className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Certification Name
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={cert.name}
                                       onChange={(e) =>
                                          handleChange("certifications", [
                                             ...userDetails.certifications.slice(
                                                0,
                                                index
                                             ),
                                             { ...cert, name: e.target.value },
                                             ...userDetails.certifications.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter certification name"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Issuing Organization
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={cert.issuer}
                                       onChange={(e) =>
                                          handleChange("certifications", [
                                             ...userDetails.certifications.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...cert,
                                                issuer: e.target.value,
                                             },
                                             ...userDetails.certifications.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter issuing organization"
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Issue Date
                                    </Label>
                                    <DatePicker
                                       selected={
                                          isValidDate(cert.date)
                                             ? new Date(cert.date)
                                             : null
                                       }
                                       onChange={(date) =>
                                          handleDateChange(
                                             date,
                                             "date",
                                             index,
                                             "certifications"
                                          )
                                       }
                                       dateFormat="MM/yyyy"
                                       showMonthYearPicker
                                       className="w-full h-10 rounded-md border border-input"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Expiry Date (Optional)
                                    </Label>
                                    <DatePicker
                                       selected={
                                          isValidDate(cert.expiryDate)
                                             ? new Date(cert.expiryDate)
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
                                       className="w-full h-10 rounded-md border border-input"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                       Credential ID
                                    </Label>
                                    <Input
                                       className="h-10"
                                       value={cert.credentialId}
                                       onChange={(e) =>
                                          handleChange("certifications", [
                                             ...userDetails.certifications.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...cert,
                                                credentialId: e.target.value,
                                             },
                                             ...userDetails.certifications.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter credential ID"
                                    />
                                 </div>
                              </div>

                              <Button
                                 type="button"
                                 variant="destructive"
                                 onClick={() =>
                                    handleRemoveField("certifications", index)
                                 }
                                 className="mt-6"
                              >
                                 <Trash2 className="mr-2 h-4 w-4" />
                                 Remove Certification
                              </Button>
                           </CardContent>
                        </Card>
                     ))}
                  </CardContent>
               </Card>

               {/* Projects Card */}
               <Card className="bg-white/90 shadow-lg border-0 backdrop-blur-xl rounded-xl">
                  <CardHeader className="border-b bg-white/50 px-6 py-4 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-semibold text-gray-800">
                        Projects
                     </CardTitle>
                     <Button
                        type="button"
                        onClick={(e) =>
                           handleAddField(e, "projects", {
                              name: "",
                              description: "",
                              technologies: "",
                              startDate: "",
                              endDate: "",
                              link: "",
                           })
                        }
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                     >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Project
                     </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                     {userDetails.projects.map((project, index) => (
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
                                             ...userDetails.projects.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...project,
                                                name: e.target.value,
                                             },
                                             ...userDetails.projects.slice(
                                                index + 1
                                             ),
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
                                             ...userDetails.projects.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...project,
                                                technologies: e.target.value,
                                             },
                                             ...userDetails.projects.slice(
                                                index + 1
                                             ),
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
                                          ...userDetails.projects.slice(
                                             0,
                                             index
                                          ),
                                          {
                                             ...project,
                                             description: e.target.value,
                                          },
                                          ...userDetails.projects.slice(
                                             index + 1
                                          ),
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
                                             ...userDetails.projects.slice(
                                                0,
                                                index
                                             ),
                                             {
                                                ...project,
                                                link: e.target.value,
                                             },
                                             ...userDetails.projects.slice(
                                                index + 1
                                             ),
                                          ])
                                       }
                                       placeholder="Enter project link"
                                    />
                                 </div>
                              </div>

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
                              </Button>
                           </CardContent>
                        </Card>
                     ))}
                  </CardContent>
               </Card>

               {/* Form Actions */}
               <div className="sticky bottom-0 py-4 bg-white/80 backdrop-blur-xl border-t shadow-lg">
                  <div className="max-w-4xl mx-auto px-4 flex justify-end gap-4">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                     >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                     </Button>
                     <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        disabled={isLoading}
                     >
                        {isLoading ? (
                           <>
                              <Spinner className="w-4 h-4 border-2 mr-2" />
                              <p className="text-pink-600 font-medium">
                                 Saving...
                              </p>
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
   );
};

export default UserForm;
