import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ParsedResume, ResumeTemplate } from "@/lib/types";

type PdfTheme = {
  pagePadding: number;
  baseFontSize: number;
  headerNameSize: number;
  headerAccent: string;
  textColor: string;
  mutedColor: string;
  ruleColor: string;
  bulletColor: string;
  sectionGap: number;
  itemGap: number;
  sectionTracking: number;
};

const PDF_THEMES: Record<ResumeTemplate, PdfTheme> = {
  classic: {
    pagePadding: 34,
    baseFontSize: 10.4,
    headerNameSize: 20,
    headerAccent: "#0f172a",
    textColor: "#111827",
    mutedColor: "#475569",
    ruleColor: "#cbd5e1",
    bulletColor: "#0f766e",
    sectionGap: 14,
    itemGap: 10,
    sectionTracking: 0.7,
  },
  modern: {
    pagePadding: 32,
    baseFontSize: 10.2,
    headerNameSize: 21,
    headerAccent: "#0f766e",
    textColor: "#0f172a",
    mutedColor: "#475569",
    ruleColor: "#99f6e4",
    bulletColor: "#0f766e",
    sectionGap: 13,
    itemGap: 9,
    sectionTracking: 0.45,
  },
  minimal: {
    pagePadding: 28,
    baseFontSize: 9.7,
    headerNameSize: 18,
    headerAccent: "#111827",
    textColor: "#111827",
    mutedColor: "#4b5563",
    ruleColor: "#d1d5db",
    bulletColor: "#111827",
    sectionGap: 10,
    itemGap: 7,
    sectionTracking: 0.2,
  },
};

function buildStyles(theme: PdfTheme) {
  return StyleSheet.create({
    page: {
      paddingTop: theme.pagePadding,
      paddingBottom: theme.pagePadding,
      paddingHorizontal: theme.pagePadding,
      fontSize: theme.baseFontSize,
      fontFamily: "Helvetica",
      color: theme.textColor,
      lineHeight: 1.34,
    },
    header: {
      marginBottom: theme.sectionGap,
    },
    name: {
      fontSize: theme.headerNameSize,
      fontWeight: 700,
      color: theme.headerAccent,
      marginBottom: 4,
    },
    contactLine: {
      color: theme.mutedColor,
      fontSize: theme.baseFontSize - 0.3,
      marginTop: 2,
    },
    section: {
      marginTop: theme.sectionGap,
    },
    sectionTitleWrap: {
      borderBottomWidth: 1,
      borderBottomColor: theme.ruleColor,
      paddingBottom: 4,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: theme.baseFontSize - 0.3,
      textTransform: "uppercase",
      letterSpacing: theme.sectionTracking,
      fontWeight: 700,
      color: theme.headerAccent,
    },
    paragraph: {
      lineHeight: 1.45,
    },
    item: {
      marginBottom: theme.itemGap,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
      marginBottom: 2,
    },
    itemTitle: {
      fontSize: theme.baseFontSize + 0.4,
      fontWeight: 700,
      color: theme.textColor,
      maxWidth: "72%",
    },
    itemDate: {
      fontSize: theme.baseFontSize - 0.4,
      color: theme.mutedColor,
      textAlign: "right",
      maxWidth: "28%",
    },
    itemMeta: {
      color: theme.mutedColor,
      fontSize: theme.baseFontSize - 0.4,
      marginBottom: 5,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 6,
      marginBottom: 3,
    },
    bulletDot: {
      width: 7,
      color: theme.bulletColor,
      fontWeight: 700,
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      lineHeight: 1.42,
    },
    skillGroup: {
      marginBottom: 4,
    },
    skillLabel: {
      fontWeight: 700,
      color: theme.textColor,
    },
  });
}

function joinNonEmpty(values: Array<string | undefined>) {
  return values.filter(Boolean).join(" | ");
}

function ResumeSection({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleWrap} minPresenceAhead={72}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function BulletList({
  items,
  styles,
}: {
  items: string[];
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function ResumePdfDocument({
  resume,
  templateUsed,
}: {
  resume: ParsedResume;
  templateUsed: ResumeTemplate;
}) {
  const theme = PDF_THEMES[templateUsed] ?? PDF_THEMES.classic;
  const styles = buildStyles(theme);
  const profileLinks = joinNonEmpty([
    resume.personal.linkedin,
    resume.personal.github,
    resume.personal.portfolio,
  ]);

  const skillGroups = [
    { label: "Technical", values: resume.skills.technical },
    { label: "Tools", values: resume.skills.tools },
    { label: "Languages", values: resume.skills.languages ?? [] },
    { label: "Certifications", values: resume.skills.certifications ?? [] },
    { label: "Soft Skills", values: resume.skills.soft ?? [] },
  ].filter((group) => group.values.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{resume.personal.name}</Text>
          <Text style={styles.contactLine}>
            {joinNonEmpty([
              resume.personal.email,
              resume.personal.phone,
              resume.personal.location,
            ])}
          </Text>
          {profileLinks ? <Text style={styles.contactLine}>{profileLinks}</Text> : null}
        </View>

        {resume.summary ? (
          <ResumeSection styles={styles} title="Professional Summary">
            <Text style={styles.paragraph}>{resume.summary}</Text>
          </ResumeSection>
        ) : null}

        {resume.experience.length ? (
          <ResumeSection styles={styles} title="Professional Experience">
            {resume.experience.map((job, index) => (
              <View
                key={`${job.company}-${job.title}-${job.startDate}-${index}`}
                style={styles.item}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{job.title}</Text>
                  <Text style={styles.itemDate}>{`${job.startDate} - ${job.endDate}`}</Text>
                </View>
                <Text style={styles.itemMeta}>
                  {joinNonEmpty([job.company, job.location])}
                </Text>
                <BulletList items={job.bullets} styles={styles} />
              </View>
            ))}
          </ResumeSection>
        ) : null}

        {resume.projects?.length ? (
          <ResumeSection styles={styles} title="Projects">
            {resume.projects.map((project, index) => (
              <View
                key={`${project.name}-${index}`}
                style={styles.item}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{project.name}</Text>
                  <Text style={styles.itemDate}>
                    {project.techStack.join(" • ")}
                  </Text>
                </View>
                <Text style={styles.itemMeta}>
                  {joinNonEmpty([project.description, project.link])}
                </Text>
                {project.bullets?.length ? (
                  <BulletList items={project.bullets} styles={styles} />
                ) : null}
              </View>
            ))}
          </ResumeSection>
        ) : null}

        {resume.education.length ? (
          <ResumeSection styles={styles} title="Education">
            {resume.education.map((item, index) => (
              <View
                key={`${item.institution}-${item.degree}-${index}`}
                style={styles.item}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.degree}</Text>
                  <Text style={styles.itemDate}>{item.year}</Text>
                </View>
                <Text style={styles.itemMeta}>
                  {joinNonEmpty([item.institution, item.gpa])}
                </Text>
                {item.highlights?.length ? (
                  <BulletList items={item.highlights} styles={styles} />
                ) : null}
              </View>
            ))}
          </ResumeSection>
        ) : null}

        {skillGroups.length ? (
          <ResumeSection styles={styles} title="Skills">
            {skillGroups.map((group) => (
              <Text key={group.label} style={styles.skillGroup}>
                <Text style={styles.skillLabel}>{group.label}: </Text>
                <Text>{group.values.join(", ")}</Text>
              </Text>
            ))}
          </ResumeSection>
        ) : null}

        {resume.achievements?.length ? (
          <ResumeSection styles={styles} title="Achievements">
            <BulletList items={resume.achievements} styles={styles} />
          </ResumeSection>
        ) : null}

        {resume.publications?.length ? (
          <ResumeSection styles={styles} title="Publications">
            <BulletList items={resume.publications} styles={styles} />
          </ResumeSection>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generateResumePdfBuffer(
  resume: ParsedResume,
  templateUsed: ResumeTemplate = "classic",
) {
  return renderToBuffer(
    <ResumePdfDocument resume={resume} templateUsed={templateUsed} />,
  );
}
