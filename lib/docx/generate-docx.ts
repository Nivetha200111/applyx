import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { ParsedResume, ResumeTemplate } from "@/lib/types";

function addBulletParagraphs(items: string[] = []) {
  return items.map(
    (item) =>
      new Paragraph({
        text: item,
        bullet: { level: 0 },
      }),
  );
}

function addSkillParagraph(label: string, values: string[] = []) {
  if (!values.length) {
    return null;
  }

  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun(values.join(", ")),
    ],
  });
}

export async function generateResumeDocxBuffer(
  resume: ParsedResume,
  _templateUsed: ResumeTemplate = "classic",
) {
  void _templateUsed;

  const skillParagraphs = [
    addSkillParagraph("Technical", resume.skills.technical),
    addSkillParagraph("Tools", resume.skills.tools),
    addSkillParagraph("Languages", resume.skills.languages ?? []),
    addSkillParagraph("Certifications", resume.skills.certifications ?? []),
    addSkillParagraph("Soft Skills", resume.skills.soft ?? []),
  ].filter(Boolean) as Paragraph[];

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
          ...(
            [resume.personal.linkedin, resume.personal.github, resume.personal.portfolio]
              .filter(Boolean)
              .length
              ? [
                  new Paragraph({
                    text: [
                      resume.personal.linkedin,
                      resume.personal.github,
                      resume.personal.portfolio,
                    ]
                      .filter(Boolean)
                      .join(" | "),
                  }),
                ]
              : []
          ),
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
            ...addBulletParagraphs(job.bullets),
          ]),
          ...(resume.projects?.length
            ? [
                new Paragraph({
                  text: "Projects",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...resume.projects.flatMap((project) => [
                  new Paragraph({
                    text: `${project.name} | ${project.techStack.join(", ")}`,
                    heading: HeadingLevel.HEADING_2,
                  }),
                  new Paragraph([project.description, project.link].filter(Boolean).join(" | ")),
                  ...addBulletParagraphs(project.bullets),
                ]),
              ]
            : []),
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_1,
          }),
          ...resume.education.flatMap((item) => [
            new Paragraph({
              text: item.degree,
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(
              [item.institution, item.year, item.gpa]
                .filter(Boolean)
                .join(" | "),
            ),
            ...addBulletParagraphs(item.highlights),
          ]),
          new Paragraph({
            text: "Skills",
            heading: HeadingLevel.HEADING_1,
          }),
          ...skillParagraphs,
          ...(resume.achievements?.length
            ? [
                new Paragraph({
                  text: "Achievements",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...addBulletParagraphs(resume.achievements),
              ]
            : []),
          ...(resume.publications?.length
            ? [
                new Paragraph({
                  text: "Publications",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...addBulletParagraphs(resume.publications),
              ]
            : []),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
