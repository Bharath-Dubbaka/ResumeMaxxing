import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
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
            // Name Header with border bottom
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: resumeData.fullName + " | " + resumeData.contactInformation || "",
                  bold: true,
                  size: 32,
                  color: "007B8F",
                  font: "Arial",
              }),
                // new TextRun({
                //     text: resumeData.contactInformation || "",
                //     size: 24,
                //     color: "666666", // Gray color to match preview
                //     font: "Arial",
                // }),
             
            ],
              spacing: { after: 300 },
          }),

          // Name Header (Bold and Centered)
          // new Paragraph({
          //     alignment: AlignmentType.CENTER,
          //     children: [
          //         new TextRun({
          //             text: resumeData.fullName || "",
          //             bold: true,
          //             size: 32,
          //             font: "Arial",
          //         }),
          //     ],
          //     spacing: { after: 400 },
          // }),

  
            // Professional Summary
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
  
            // Experience entries with dates
            ...(resumeData.professionalExperience || []).map((exp) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.title || ""}`,
                    bold: true,
                    size: 20,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` - ${exp.employer || ""}`,
                    size: 20,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: `\n${exp.startDate || ""} - ${exp.endDate || "Present"}`,
                    size: 20,
                    color: "666666",
                    font: "Arial",
                  }),
                ],
                spacing: { before: 200, after: 100 },
              }),
              ...(exp.responsibilities || []).map(
                (responsibility) =>
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: responsibility,
                        size: 20,
                        font: "Arial",
                      }),
                    ],
                    bullet: { level: 0 },
                    spacing: { before: 100 },
                    indent: { left: 720 },
                  })
              ),
            ]).flat(),
  
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
                    spacing: { before: 400, after: 200 },
                  }),
                  ...resumeData.education.map((edu) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${edu.degree || ""}`,
                          bold: true,
                          size: 20,
                          font: "Arial",
                        }),
                        new TextRun({
                          text: ` - ${edu.institution || ""}`,
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