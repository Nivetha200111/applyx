import { requireUser } from "@/lib/auth";
import { TemplateList } from "@/components/templates/template-list";

export default async function TemplatesPage() {
  await requireUser("/templates");
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">Message Templates</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Ready-to-use templates for outreach, follow-ups, and thank-you messages.
          Fill in your details and copy.
        </p>
      </div>
      <TemplateList />
    </div>
  );
}
