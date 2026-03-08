import { resumeTemplates } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  selected?: string;
}

export function TemplatePicker({ selected = "classic" }: TemplatePickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Templates</CardTitle>
        <CardDescription>
          Three ATS-safe templates are scaffolded for the generation step.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {resumeTemplates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "rounded-[24px] border border-border/70 bg-card/80 p-4 transition-all duration-200 hover:-translate-y-1",
              selected === template.id && "border-primary/60 bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{template.name}</div>
              {selected === template.id ? <Badge variant="success">Selected</Badge> : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {template.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
