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
import React, { useState, useEffect } from "react";
import { Download, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { toast, Toaster } from "sonner";

export const BNPformat = (resumeData) =>
  new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inches
              right: 720, // 0.5 inches
              bottom: 720, // 0.5 inches
              left: 720, // 0.5 inches
            },
          },
        },
        children: [
          // Header Section - Centered
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.fullName,
                bold: true,
                size: 36, // Increased for better header visibility
                font: "Roboto",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.contactInformation,
                size: 24,
                color: "666666", // Gray color to match preview
                font: "Roboto",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Professional Summary
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Summary",
                bold: true,
                size: 28,
                font: "Roboto",
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
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.professionalSummary,
                size: 24,
                font: "Roboto",
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
                font: "Roboto",
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
          new Paragraph({
            children: [
              new TextRun({
                text: resumeData.technicalSkills,
                size: 24,
                font: "Roboto",
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
                font: "Roboto",
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
                  font: "Roboto",
                }),
                new TextRun({
                  text: `\t${exp.startDate} - ${exp.endDate}`,
                  size: 24,
                  color: "666666", // Gray color to match preview
                  font: "Roboto",
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
                  font: "Roboto",
                }),
                new TextRun({
                  text: `, ${exp.location}`,
                  size: 24,
                  font: "Roboto",
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
                      font: "Roboto",
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
                font: "Roboto",
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
                    font: "Roboto",
                  }),
                  ...(edu.startDate && edu.endDate
                    ? [
                        new TextRun({
                          text: `, ${edu.startDate.split("-")[0]} - ${
                            edu.endDate.split("-")[0]
                          }`,
                          size: 24,
                          font: "Roboto",
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
                      font: "Roboto",
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
                          font: "Roboto",
                        }),
                        ...(cert.issuer
                          ? [
                              new TextRun({
                                text: ` - ${cert.issuer}`,
                                size: 24,
                                font: "Roboto",
                              }),
                            ]
                          : []),
                        ...(cert.issueDate
                          ? [
                              new TextRun({
                                text: `, ${cert.issueDate.split("-")[0]}`,
                                size: 24,
                                font: "Roboto",
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
                                font: "Roboto",
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
                      font: "Roboto",
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
                          font: "Roboto",
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
                          font: "Roboto",
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
            font: "Roboto",
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
            },
          },
        },
      ],
    },
  });
