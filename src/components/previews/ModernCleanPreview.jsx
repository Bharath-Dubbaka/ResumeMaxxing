import { Trash2 } from "lucide-react";

export default function ModernCleanPreview({
  resumeData = {},
  isEditing = false,
  handleEdit = () => {},
  handleExperienceEdit = () => {},
  handleResponsibilityEdit = () => {},
  handleAddResponsibility = () => {},
  savedResponsibilities = {},
  handleSaveToCustom = () => {}
}) {
  if (!resumeData) return null;

  return (
    <div className="bg-white font-['Arial'] text-black p-8 rounded-lg max-h-[800px] overflow-y-auto">
      <div className="space-y-6">
        {/* Name Header - Centered with contact info */}
        <div className="text-center pb-4 pt-4">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={resumeData.fullName || ""}
                onChange={(e) => handleEdit("fullName", e.target.value)}
                className="w-full border rounded p-1 text-center"
              />
              <input
                type="text"
                value={resumeData.contactInformation || ""}
                onChange={(e) => handleEdit("contactInformation", e.target.value)}
                className="w-full border rounded p-1 text-center"
              />
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-[#007B8F]">
              {resumeData.fullName} | {resumeData.contactInformation}
            </h1>
          )}
        </div>

        {/* Two Column Layout for Contact and Skills */}
        <div className="grid grid-cols-2 gap-8 mt-6">
          {/* Skills Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-600 mb-3">SKILLS</h2>
            {isEditing ? (
              <textarea
                value={resumeData.technicalSkills || ""}
                onChange={(e) => handleEdit("technicalSkills", e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
            ) : (
              <p className="text-base">{resumeData.technicalSkills}</p>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-600 mb-2">
            PROFESSIONAL SUMMARY
          </h2>
          {isEditing ? (
            <textarea
              value={resumeData.professionalSummary || ""}
              onChange={(e) => handleEdit("professionalSummary", e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
            />
          ) : (
            <p className="text-sm">{resumeData.professionalSummary}</p>
          )}
        </div>

        {/* Work History */}
        <div>
          <h2 className="text-lg font-bold text-gray-600 mb-4">WORK HISTORY</h2>
          {resumeData.professionalExperience?.map((exp, expIndex) => (
            <div key={expIndex} className="mb-4">
              <div className="font-semibold">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={exp.title || ""}
                      onChange={(e) =>
                        handleExperienceEdit(expIndex, "title", e.target.value)
                      }
                      className="w-full border rounded p-1 mb-1"
                    />
                    <input
                      type="text"
                      value={exp.employer || ""}
                      onChange={(e) =>
                        handleExperienceEdit(expIndex, "employer", e.target.value)
                      }
                      className="w-full border rounded p-1 mb-1"
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={exp.startDate || ""}
                        onChange={(e) =>
                          handleExperienceEdit(expIndex, "startDate", e.target.value)
                        }
                        className="border rounded p-1"
                      />
                      <input
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          handleExperienceEdit(expIndex, "endDate", e.target.value)
                        }
                        className="border rounded p-1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>{exp.title}</div>
                    <div>{exp.employer}</div>
                    <div className="text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </div>
                  </>
                )}
              </div>
              <ul className="list-disc ml-6 mt-2">
                {exp.responsibilities?.map((resp, respIndex) => (
                  <li key={respIndex} className="text-sm mb-1">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) =>
                            handleResponsibilityEdit(
                              expIndex,
                              respIndex,
                              e.target.value
                            )
                          }
                          className="w-full border rounded p-1"
                        />
                        <button
                          onClick={() => handleSaveToCustom(expIndex, resp)}
                          disabled={savedResponsibilities[`${expIndex}-${resp}`]}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      resp
                    )}
                  </li>
                ))}
              </ul>
              {isEditing && (
                <button
                  onClick={() => handleAddResponsibility(expIndex)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Responsibility
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Education */}
        {resumeData.education && (
          <div>
            <h2 className="text-lg font-bold text-gray-600 mb-2">EDUCATION</h2>
            {resumeData.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">
                  <span className="font-semibold">{edu.degree}</span> -{" "}
                  {edu.institution}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}