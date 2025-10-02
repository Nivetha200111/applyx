import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

export async function scrapeLinkedIn(searchQuery: string) {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_KEY as string
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  await page.goto(
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
      searchQuery
    )}`
  );
  await page.waitForSelector(".job-card-container");

  const jobs = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".job-card-container")
    ).map((card) => ({
      title: card.querySelector(".job-card-list__title")?.textContent?.trim(),
      company: card
        .querySelector(".job-card-container__company-name")
        ?.textContent?.trim(),
      location: card
        .querySelector(".job-card-container__metadata-item")
        ?.textContent?.trim(),
      url: (card.querySelector("a") as HTMLAnchorElement | null)?.href,
    }));
  });

  const withKeys = (jobs as Array<{ url?: string | undefined }>)
    .filter((j) => j.url)
    .map((job) => ({
      ...job,
      platform: "linkedin",
      external_id: job.url ? new URL(job.url).searchParams.get("currentJobId") : null,
    }));

  await supabase.from("jobs").upsert(withKeys, { onConflict: "platform,external_id" });
  await browser.close();
}


