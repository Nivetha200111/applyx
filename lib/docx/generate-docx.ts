import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { ParsedResume } from "@/lib/types";

export async function generateResumeDocxBuffer(resume: ParsedResume) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: resume.personal.name,
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun(
                [
                  resume.personal.email,
                  resume.personal.phone,
                  resume.personal.location,
                ]
                  .filter(Boolean)
                  .join(" | "),
              ),
            ],
          }),
          ...(resume.summary
            ? [
                new Paragraph({
                  text: "Professional Summary",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph(resume.summary),
              ]
            : []),
          new Paragraph({
            text: "Professional Experience",
            heading: HeadingLevel.HEADING_1,
          }),
          ...resume.experience.flatMap((job) => [
            new Paragraph({
              text: `${job.title} | ${job.company}`,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph([job.location, `${job.startDate} - ${job.endDate}`].filter(Boolean).join(" | ")),
            ...job.bullets.map(
              (bullet) =>
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                }),
            ),
          ]),
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_1,
          }),
          ...resume.education.map(
            (item) =>
              new Paragraph(
                [item.degree, item.institution, item.year, item.gpa]
                  .filter(Boolean)
                  .join(" | "),
              ),
          ),
          new Paragraph({
            text: "Skills",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph(`Technical: ${resume.skills.technical.join(", ")}`),
          new Paragraph(`Tools: ${resume.skills.tools.join(", ")}`),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
