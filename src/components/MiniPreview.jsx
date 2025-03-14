import React from 'react';

const MiniPreview = ({ userDetails }) => {
  return (
    <div className="w-[33%] mr-2 bg-white shadow-xl rounded-xl border border-gray-200 overflow-y-auto max-h-fit">
{/* Updated Note */}
<div className='text-gray-600 relative top-[-5px] left-[10px] bg-gray-200 px-2 py-1 rounded-lg'>
            Sample Preview: <span className='text-blue-500 text-sm cursor-pointer'> (More templates available!)</span>
        </div>
    <div >
      {/* Reuse the same resume preview styles */}
      <div className="p-8 space-y-6 text-[11px] leading-relaxed">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {userDetails?.fullName || 'Your Name'}
          </h1>
          <p className="text-gray-600 mt-1">
            {userDetails?.email && userDetails?.phone 
              ? `${userDetails.email} | ${userDetails.phone}`
              : 'Enter your city, state, ZIP Code and (optionally) your LinkedIn URL'}
          </p>
        </div>

        {/* Professional Summary */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-gray-600 italic">
            {userDetails?.summary || 
              'Use this section to give recruiters a quick glimpse of your professional profile. In just 3-4 lines, highlight your background, education and main skills.'}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Skills
          </h2>
          {userDetails?.customSkills?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {userDetails.customSkills.map((skill, index) => (
                <div key={index} className="text-gray-600">
                  {skill.skill},
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">
              List your professional skills in bullet points so they're easy for recruiters to read.
            </p>
          )}
        </div>

        {/* Work History */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Work History
          </h2>
          {userDetails?.experience?.length > 0 ? (
            <div className="space-y-4">
              {userDetails.experience.map((exp, index) => (
                <div key={index}>
                  <div className='flex justify-between'>
                  <p className="font-medium text-gray-800">
                    <p>{exp.title}</p>
                    <p>{exp.employer} {exp.location ? `| ${exp.location}` : ''}</p>
                  </p>
                  <p className="text-gray-600">
                    {exp.startDate} - {exp.endDate}
                  </p>
                  </div>
                  <div>
                    <ul className="list-disc pl-4 text-[10px]">
                      <li>Responsibilities</li>
                      <li>Responsibilities</li>
                    </ul>
                  </div>
                  
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-600 italic space-y-2">
              <p>Summarize your work experience by listing each job with your responsibilities in 2-3 lines. Start with your most recent job and work backwards using the format below:</p>
              <p>Job Title & Time employed (Month/year - Month/year)</p>
              <p>Company Name</p>
              <ul className="list-disc pl-4">
                <li>Responsibilities</li>
                <li>Responsibilities</li>
                <li>Responsibilities</li>
              </ul>
            </div>
          )}
        </div>

        {/* Education */}
        <div>
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
            Education
          </h2>
          {userDetails?.education?.length > 0 ? (
            <div className="space-y-2">
              {userDetails.education.map((edu, index) => (
                <div key={index} className="flex">
                  <p className="font-medium text-gray-800 pr-2">{edu.degree}</p>
                  <p className="text-gray-600 pr-2">{edu.institution ? `- ${edu.institution}` : ''}</p>
                  <p className="text-gray-500">
                    {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">
              Include your degree, school name and the year you graduated. If you don't have a degree, list coursework or training that's relevant to the job you're applying for.
            </p>
          )}
        </div>

        {/* Optional Sections */}
        {(userDetails?.certifications?.length > 0 || userDetails?.projects?.length > 0) && (
          <>
            {/* Certifications */}
            {userDetails?.certifications?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
                  Certifications
                </h2>
                <div className="space-y-1">
                  {userDetails.certifications.map((cert, index) => (
                    <p key={index} className="text-gray-600">
                      • {cert.name} ({cert.issuer})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {userDetails?.projects?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
                  Projects
                </h2>
                <div className="space-y-2">
                  {userDetails.projects.map((project, index) => (
                    <div key={index}>
                      <p className="font-medium text-gray-800">{project.name}</p>
                      <p className="text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default MiniPreview;
