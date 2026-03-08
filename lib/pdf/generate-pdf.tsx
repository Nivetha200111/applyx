import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ParsedResume } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
  },
  contact: {
    marginTop: 6,
    color: "#475569",
    fontSize: 10,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#64748b",
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  jobMeta: {
    color: "#475569",
    fontSize: 9.5,
    marginBottom: 6,
  },
  bullet: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  bulletDot: {
    width: 6,
    color: "#10b981",
  },
  paragraph: {
    lineHeight: 1.45,
  },
});

function ResumePdfDocument({ resume }: { resume: ParsedResume }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{resume.personal.name}</Text>
          <Text style={styles.contact}>
            {[
              resume.personal.email,
              resume.personal.phone,
              resume.personal.location,
            ]
              .filter(Boolean)
              .join(" | ")}
          </Text>
        </View>

        {resume.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.paragraph}>{resume.summary}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {resume.experience.map((job) => (
            <View key={`${job.company}-${job.title}`} style={{ marginBottom: 10 }}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text>{`${job.startDate} - ${job.endDate}`}</Text>
              </View>
              <Text style={styles.jobMeta}>
                {[job.company, job.location].filter(Boolean).join(" | ")}
              </Text>
              {job.bullets.map((bullet) => (
                <View key={bullet} style={styles.bullet}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.paragraph}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {resume.education.map((item) => (
            <View key={`${item.institution}-${item.degree}`} style={{ marginBottom: 8 }}>
              <Text style={styles.jobTitle}>{item.degree}</Text>
              <Text style={styles.jobMeta}>
                {[item.institution, item.year, item.gpa].filter(Boolean).join(" | ")}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.paragraph}>
            Technical: {resume.skills.technical.join(", ")}
          </Text>
          <Text style={styles.paragraph}>Tools: {resume.skills.tools.join(", ")}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateResumePdfBuffer(resume: ParsedResume) {
  return renderToBuffer(<ResumePdfDocument resume={resume} />);
}
