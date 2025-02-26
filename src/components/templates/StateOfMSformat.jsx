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

export const StateOfMSformat = (resumeData) =>
  new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inches
              right: 620,
              bottom: 720, // 0.5 inches
              left: 620,
            },
          },
        },
        children: [
          // Header Section - Centered
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.fullName,
                //   bold: true,
                size: 36, // Increased for better header visibility
                color: "000000",
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.contactInformation,
                size: 24,
                color: "666666", // Gray color to match preview
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
          }),

          // Professional Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Summary",
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
            spacing: { before: 200, after: 200 },
            border: {
              bottom: {
                color: "999999",
                size: 1,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.professionalSummary,
                size: 24,
                font: "Cambria",
              }),
            ],
            spacing: { after: 400 },
          }),

          // Technical Skills
          new Paragraph({
            children: [
              new TextRun({
                text: "Technical Skills",
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
            spacing: { before: 200, after: 200 },
            border: {
              bottom: {
                color: "999999",
                size: 1,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.technicalSkills,
                size: 24,
                font: "Cambria",
              }),
            ],
            spacing: { after: 400 },
          }),

          // Professional Experience
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Experience",
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "999999",
                size: 1,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          ...resumeData.professionalExperience.flatMap((exp) => [
            // Title and Dates
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.title,
                  bold: true,
                  size: 26,
                  font: "Arial",
                }),
                new TextRun({
                  text: `\t${exp.startDate} - ${exp.endDate}`,
                  size: 24,
                  color: "666666", // Gray color to match preview
                  font: "Arial",
                }),
              ],
              spacing: { before: 300, after: 100 },
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9000,
                },
              ],
            }),
            // Employer and Location
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.employer,
                  size: 24,
                  font: "Arial",
                }),
                new TextRun({
                  text: `, ${exp.location}`,
                  size: 24,
                  font: "Arial",
                }),
              ],
              spacing: { before: 100, after: 200 },
            }),
            // Responsibilities (custom and generated merged)
            ...exp.responsibilities.map(
              (responsibility) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: responsibility,
                      size: 24,
                      font: "Cambria",
                    }),
                  ],
                  bullet: {
                    level: 0,
                  },
                  indent: { left: 720 }, // Indent for bullet points
                  spacing: { before: 100, after: 100 },
                })
            ),
          ]),

          // Education
          new Paragraph({
            children: [
              new TextRun({
                text: "Education",
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "999999",
                size: 1,
                style: BorderStyle.SINGLE,
              },
            },
          }),
          ...resumeData.education
            .map((edu) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.degree} - ${edu.institution}`,
                    bold: true,
                    size: 24,
                    font: "Cambria",
                  }),
                  ...(edu.startDate && edu.endDate
                    ? [
                        new TextRun({
                          text: `, ${edu.startDate.split("-")[0]} - ${
                            edu.endDate.split("-")[0]
                          }`,
                          size: 24,
                          font: "Cambria",
                        }),
                      ]
                    : []),
                ],
                bullet: {
                  level: 0,
                },
                spacing: { before: 100 },
              }),
            ])
            .flat(),

          // Certifications
          ...(resumeData.certifications && resumeData.certifications.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Certifications",
                      bold: true,
                      size: 28,
                      font: "Arial",
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                  border: {
                    bottom: {
                      color: "999999",
                      size: 1,
                      style: BorderStyle.SINGLE,
                    },
                  },
                }),
                ...resumeData.certifications.map(
                  (cert) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cert.name,
                          bold: true,
                          size: 24,
                          font: "Cambria",
                        }),
                        ...(cert.issuer
                          ? [
                              new TextRun({
                                text: ` - ${cert.issuer}`,
                                size: 24,
                                font: "Cambria",
                              }),
                            ]
                          : []),
                        ...(cert.issueDate
                          ? [
                              new TextRun({
                                text: `, ${cert.issueDate.split("-")[0]}`,
                                size: 24,
                                font: "Cambria",
                              }),
                            ]
                          : []),
                        ...(cert.expiryDate
                          ? [
                              new TextRun({
                                text: ` (Valid until ${
                                  cert.expiryDate.split("-")[0]
                                })`,
                                size: 24,
                                font: "Cambria",
                              }),
                            ]
                          : []),
                      ],
                      bullet: {
                        level: 0,
                      },
                      spacing: { before: 100 },
                    })
                ),
              ]
            : []),

          // Projects
          ...(resumeData.projects && resumeData.projects.length > 0
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Projects",
                      bold: true,
                      size: 28,
                      font: "Arial",
                    }),
                  ],
                  spacing: { before: 400, after: 200 },
                  border: {
                    bottom: {
                      color: "999999",
                      size: 1,
                      style: BorderStyle.SINGLE,
                    },
                  },
                }),
                ...resumeData.projects
                  .map((project) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.name,
                          size: 24,
                          font: "Cambria",
                        }),
                      ],
                      bullet: {
                        level: 0,
                      },
                      spacing: { before: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.description,
                          size: 24,
                          font: "Cambria",
                        }),
                      ],
                      spacing: { before: 0, after: 200 }, // Add spacing after description
                      indent: { left: 720 },
                    }),
                  ])
                  .flat(),
              ]
            : []),
        ],
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          quickFormat: true,
          run: {
            font: "Cambria",
          },
          paragraph: {
            spacing: {
              line: 240, // 1.5 line spacing
            },
          },
        },
      ],
    },
  });
