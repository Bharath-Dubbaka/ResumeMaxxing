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
    <div className="bg-white text-black p-8 rounded-lg max-h-[800px] overflow-y-auto">
      <div className="space-y-6">
        {/* Name Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-[#1B365D]">
            {isEditing ? (
              <input
                type="text"
                value={resumeData.fullName || ""}
                onChange={(e) => handleEdit("fullName", e.target.value)}
                className="w-full border rounded p-1"
              />
            ) : (
              resumeData.fullName
            )}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Contact Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-600 mb-2">CONTACT</h2>
            {isEditing ? (
              <textarea
                value={resumeData.contactInformation || ""}
                onChange={(e) => handleEdit("contactInformation", e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
            ) : (
              <p className="text-sm whitespace-pre-line">
                {resumeData.contactInformation}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div>
            <h2 className="text-lg font-bold text-gray-600 mb-2">SKILLS</h2>
            {isEditing ? (
              <textarea
                value={resumeData.technicalSkills || ""}
                onChange={(e) => handleEdit("technicalSkills", e.target.value)}
                className="w-full border rounded p-2"
                rows={3}
              />
            ) : (
              <p className="text-sm">{resumeData.technicalSkills}</p>
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
                  <input
                    type="text"
                    value={exp.title || ""}
                    onChange={(e) =>
                      handleExperienceEdit(expIndex, "title", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                ) : (
                  <span>{exp.title}</span>
                )}
                {" - "}
                {isEditing ? (
                  <input
                    type="text"
                    value={exp.employer || ""}
                    onChange={(e) =>
                      handleExperienceEdit(expIndex, "employer", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                ) : (
                  <span>{exp.employer}</span>
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
                          onClick={() =>
                            handleSaveToCustom(expIndex, resp)
                          }
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