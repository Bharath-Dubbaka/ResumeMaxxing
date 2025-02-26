import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    HeadingLevel,
    TabStopType,
    TabStopPosition,
  } from "docx";
  
  export const ModernCleanFormat = (resumeData) =>
    new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },
          children: [
            // Name Header
            new Paragraph({
              text: resumeData.fullName,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.LEFT,
              spacing: { after: 200 },
              style: {
                font: "Arial",
                size: 36,
                color: "1B365D",  // Dark blue color
              },
            }),
  
            // Contact and Skills in two columns
            new Paragraph({
              children: [
                new TextRun({
                  text: "CONTACT",
                  bold: true,
                  size: 24,
                  color: "666666",
                  font: "Arial",
                }),
              ],
              spacing: { after: 200 },
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: TabStopPosition.MAX,
                },
              ],
            }),
  
            // Contact Details
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.contactInformation || "",
                  size: 20,
                  font: "Arial",
                }),
              ],
              spacing: { after: 200 },
            }),
  
            // Professional Summary with heading
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROFESSIONAL SUMMARY",
                  bold: true,
                  size: 24,
                  color: "666666",
                  font: "Arial",
                }),
              ],
              spacing: { after: 200 },
            }),
  
            // Summary content
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.professionalSummary || "",
                  size: 20,
                  font: "Arial",
                }),
              ],
              spacing: { after: 400 },
            }),
  
            // Work History
            new Paragraph({
              children: [
                new TextRun({
                  text: "WORK HISTORY",
                  bold: true,
                  size: 24,
                  color: "666666",
                  font: "Arial",
                }),
              ],
              spacing: { after: 200 },
            }),
  
            // Experience entries
            ...(resumeData.professionalExperience || []).map((exp) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.title}`,
                    bold: true,
                    size: 20,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` - ${exp.employer}, ${exp.location}`,
                    size: 20,
                    font: "Arial",
                  }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              ...(exp.responsibilities || []).map(
                (responsibility) =>
                  new Paragraph({
                    text: responsibility,
                    bullet: {
                      level: 0,
                    },
                    spacing: { before: 100 },
                    indent: { left: 720 },
                    font: "Arial",
                    size: 20,
                  })
              ),
            ]).flat(),
  
            // Skills section
            new Paragraph({
              children: [
                new TextRun({
                  text: "SKILLS",
                  bold: true,
                  size: 24,
                  color: "666666",
                  font: "Arial",
                }),
              ],
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.technicalSkills || "",
                  size: 20,
                  font: "Arial",
                }),
              ],
              spacing: { after: 400 },
            }),
  
            // Education
            ...(resumeData.education?.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "EDUCATION",
                        bold: true,
                        size: 24,
                        color: "666666",
                        font: "Arial",
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                  ...resumeData.education.map((edu) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${edu.degree}`,
                          bold: true,
                          size: 20,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: ` - ${edu.institution}, ${edu.location}`,
                          size: 20,
                          font: "Arial",
                        }),
                      ],
                      spacing: { before: 100 },
                    })
                  ),
                ]
              : []),
          ],
        },
      ],
    });