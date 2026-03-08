import { requireUser } from "@/lib/auth";
import { getMasterResumesForUser } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ResumesPage() {
  const user = await requireUser("/resumes");
  const resumes = await getMasterResumesForUser(user.id);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Master resumes</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          These are the parsed source resumes that power all tailoring operations.
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm leading-7 text-muted-foreground">
            No resumes uploaded yet. Use the dashboard to upload your first PDF or DOCX
            resume.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>{resume.fileName}</CardTitle>
                    <CardDescription>
                      {resume.fileKind.toUpperCase()} • Parsed{" "}
                      {new Date(resume.createdAt).toLocaleDateString("en-IN")}
                    </CardDescription>
                  </div>
                  {resume.isPrimary ? <Badge>Primary</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium">Candidate</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {resume.parsedData.personal.name} • {resume.parsedData.personal.location}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium">Core skills</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {resume.parsedData.skills.technical.slice(0, 8).join(", ")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm font-medium">Summary</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {resume.parsedData.summary || "No summary detected in the uploaded file."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
