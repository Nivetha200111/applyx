import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

export class ApplicationEngine {
  private supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  async processApplication(userId: string, jobId: string) {
    const { data: profile } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const { data: job } = await this.supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (!job || !profile) return;

    if (job.platform === "linkedin") {
      await this.applyLinkedIn(job);
    }

    await this.supabase.from("applications").insert({
      user_id: userId,
      job_id: jobId,
      status: "submitted",
    });
  }

  private async applyLinkedIn(job: Record<string, unknown>) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(job.url as string);
    await browser.close();
  }
}


