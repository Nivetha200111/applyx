import type { ParsedResume, ResumeTemplate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResumePreviewProps {
  resume: ParsedResume;
  template?: ResumeTemplate;
}

const previewShellStyles: Record<ResumeTemplate, string> = {
  classic: "border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/40",
  modern: "border-emerald-200/70 bg-[linear-gradient(180deg,rgba(16,185,129,0.06),rgba(255,255,255,0))] dark:border-emerald-900/70 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.1),rgba(2,6,23,0.3))]",
  minimal: "border-slate-200/70 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/20",
};

export function ResumePreview({
  resume,
  template = "classic",
}: ResumePreviewProps) {
  return (
    <Card className={previewShellStyles[template]}>
      <CardHeader>
        <CardTitle>Resume Preview</CardTitle>
        <CardDescription>
          Single-column ATS-safe document preview for the generated resume.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{resume.personal.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {resume.personal.email} • {resume.personal.phone} • {resume.personal.location}
          </p>
          {[resume.personal.linkedin, resume.personal.github, resume.personal.portfolio]
            .filter(Boolean)
            .length ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {[resume.personal.linkedin, resume.personal.github, resume.personal.portfolio]
                  .filter(Boolean)
                  .join(" • ")}
              </p>
            ) : null}
        </section>

        {resume.summary ? (
          <section className="space-y-3">
            <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Professional Summary
            </h3>
            <p className="text-sm leading-7">{resume.summary}</p>
          </section>
        ) : null}

        <section className="space-y-4">
          <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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

        {resume.projects?.length ? (
          <section className="space-y-4">
            <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Projects
            </h3>
            {resume.projects.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-xs text-muted-foreground">{project.techStack.join(" • ")}</div>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {project.description}
                  {project.link ? ` • ${project.link}` : ""}
                </p>
                {project.bullets?.length ? (
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {project.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        <section className="space-y-3">
          <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Education
          </h3>
          <div className="space-y-3">
            {resume.education.map((item) => (
              <div key={`${item.institution}-${item.degree}`} className="space-y-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="font-semibold">{item.degree}</div>
                  <div className="text-sm text-muted-foreground">{item.year}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.institution}
                  {item.gpa ? ` • ${item.gpa}` : ""}
                </div>
                {item.highlights?.length ? (
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
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
          {resume.skills.languages?.length ? (
            <p className="text-sm leading-7 text-muted-foreground">
              <span className="font-medium text-foreground">Languages:</span>{" "}
              {resume.skills.languages.join(", ")}
            </p>
          ) : null}
          {resume.skills.certifications?.length ? (
            <p className="text-sm leading-7 text-muted-foreground">
              <span className="font-medium text-foreground">Certifications:</span>{" "}
              {resume.skills.certifications.join(", ")}
            </p>
          ) : null}
          {resume.skills.soft?.length ? (
            <p className="text-sm leading-7 text-muted-foreground">
              <span className="font-medium text-foreground">Soft Skills:</span>{" "}
              {resume.skills.soft.join(", ")}
            </p>
          ) : null}
        </section>

        {resume.achievements?.length ? (
          <section className="space-y-3">
            <h3 className="border-b border-border pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Achievements
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
              {resume.achievements.map((achievement) => (
                <li key={achievement} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
