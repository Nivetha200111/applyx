import { demoResume } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResumesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Master resumes</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          This library will store parsed source resumes before tailoring. The Step 1
          scaffold includes one sample record to anchor later upload and parsing flows.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>{demoResume.personal.name} - Product Engineering Resume</CardTitle>
              <CardDescription>
                Primary resume • PDF/DOCX upload pipeline lands here in Step 3
              </CardDescription>
            </div>
            <Badge>Primary</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-sm font-medium">Location</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {demoResume.personal.location}
            </p>
          </div>
          <div>
            <div className="text-sm font-medium">Core skills</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {demoResume.skills.technical.slice(0, 5).join(", ")}
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-medium">Summary</div>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {demoResume.summary}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
