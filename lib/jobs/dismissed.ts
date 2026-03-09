import { dbQuery } from "@/lib/db";
import type { ExternalJobSource } from "@/lib/jobs/types";

export async function getDismissedJobIds(userId: string) {
  const result = await dbQuery<{ external_job_id: string }>(
    `select external_job_id
     from public.dismissed_jobs
     where user_id = $1`,
    [userId],
  );

  return new Set(result.rows.map((row) => row.external_job_id));
}

export async function dismissJob(
  userId: string,
  externalJobId: string,
  source: ExternalJobSource,
) {
  await dbQuery(
    `insert into public.dismissed_jobs (user_id, external_job_id, source)
     values ($1, $2, $3)
     on conflict (user_id, external_job_id) do nothing`,
    [userId, externalJobId, source],
  );
}
