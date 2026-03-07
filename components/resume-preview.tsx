import type { ParsedResume } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResumePreviewProps {
  resume: ParsedResume;
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Preview</CardTitle>
        <CardDescription>
          Initial scaffold for the single-column ATS-safe document layout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">{resume.personal.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {resume.personal.email} • {resume.personal.phone} • {resume.personal.location}
          </p>
        </section>

        {resume.summary ? (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Professional Summary
            </h3>
            <p className="text-sm leading-7">{resume.summary}</p>
          </section>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Professional Experience
          </h3>
          {resume.experience.map((job) => (
            <div key={`${job.company}-${job.title}`} className="space-y-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{job.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {job.company}
                    {job.location ? ` • ${job.location}` : ""}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {job.startDate} - {job.endDate}
                </div>
              </div>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {job.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Skills
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">
            <span className="font-medium text-foreground">Technical:</span>{" "}
            {resume.skills.technical.join(", ")}
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            <span className="font-medium text-foreground">Tools:</span>{" "}
            {resume.skills.tools.join(", ")}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
