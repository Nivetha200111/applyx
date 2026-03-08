import type {
  AppUser,
  ApplicationStatus,
  JobDescriptionRecord,
  MasterResumeRecord,
  PaymentRecord,
  TailoredResumeRecord,
  TrackedApplicationRecord,
  UsageLogRecord,
} from "@/lib/types";
import { dbQuery, firstRow } from "@/lib/db";

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  plan: AppUser["plan"];
  billing_provider: string;
  billing_cycle_start: string;
  billing_cycle_end: string | null;
  demo_tailors_used: number;
  monthly_tailors_used: number;
  monthly_tailor_limit: number;
  monthly_tracker_parses_used: number;
  preferred_model_tier: AppUser["preferredModelTier"];
  billing_customer_id: string | null;
  billing_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

type MasterResumeRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string | null;
  file_kind: "pdf" | "docx";
  parsed_data: MasterResumeRecord["parsedData"];
  raw_text: string | null;
  storage_provider: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

type TailoredResumeRow = {
  id: string;
  user_id: string;
  master_resume_id: string | null;
  job_description_id: string | null;
  tailored_data: TailoredResumeRecord["tailoredData"];
  changes: TailoredResumeRecord["changes"];
  plan_tier: TailoredResumeRecord["planTier"];
  model_tier: TailoredResumeRecord["modelTier"];
  primary_model: string;
  fallback_model: string | null;
  match_score_before: number | null;
  match_score_after: number | null;
  template_used: TailoredResumeRecord["templateUsed"];
  pdf_url: string | null;
  docx_url: string | null;
  storage_provider: string;
  generation_latency_ms: number | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  job_title: string | null;
};

type UsageLogRow = {
  id: string;
  user_id: string;
  action: UsageLogRecord["action"];
  plan_tier: UsageLogRecord["planTier"];
  model_tier: UsageLogRecord["modelTier"];
  request_count: number;
  metadata: UsageLogRecord["metadata"];
  created_at: string;
};

type PaymentRow = {
  id: string;
  user_id: string;
  plan_tier: PaymentRecord["planTier"];
  amount_inr: number;
  currency: string;
  status: PaymentRecord["status"];
  billing_provider: string;
  provider_checkout_id: string | null;
  provider_payment_id: string | null;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  provider_signature: string | null;
  provider_event_type: string | null;
  payment_metadata: PaymentRecord["paymentMetadata"];
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    plan: row.plan,
    billingProvider: row.billing_provider,
    billingCycleStart: row.billing_cycle_start,
    billingCycleEnd: row.billing_cycle_end,
    demoTailorsUsed: row.demo_tailors_used,
    monthlyTailorsUsed: row.monthly_tailors_used,
    monthlyTailorLimit: row.monthly_tailor_limit,
    monthlyTrackerParsesUsed: row.monthly_tracker_parses_used,
    preferredModelTier: row.preferred_model_tier,
    billingCustomerId: row.billing_customer_id,
    billingSubscriptionId: row.billing_subscription_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMasterResume(row: MasterResumeRow): MasterResumeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileKind: row.file_kind,
    parsedData: row.parsed_data,
    rawText: row.raw_text,
    storageProvider: row.storage_provider,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTailoredResume(row: TailoredResumeRow): TailoredResumeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    masterResumeId: row.master_resume_id,
    jobDescriptionId: row.job_description_id,
    tailoredData: row.tailored_data,
    changes: row.changes,
    planTier: row.plan_tier,
    modelTier: row.model_tier,
    primaryModel: row.primary_model,
    fallbackModel: row.fallback_model,
    matchScoreBefore: row.match_score_before,
    matchScoreAfter: row.match_score_after,
    templateUsed: row.template_used,
    pdfUrl: row.pdf_url,
    docxUrl: row.docx_url,
    storageProvider: row.storage_provider,
    generationLatencyMs: row.generation_latency_ms,
    isDemo: row.is_demo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    companyName: row.company_name,
    jobTitle: row.job_title,
  };
}

function mapUsageLog(row: UsageLogRow): UsageLogRecord {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    planTier: row.plan_tier,
    modelTier: row.model_tier,
    requestCount: row.request_count,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planTier: row.plan_tier,
    amountInr: row.amount_inr,
    currency: row.currency,
    status: row.status,
    billingProvider: row.billing_provider,
    providerCheckoutId: row.provider_checkout_id,
    providerPaymentId: row.provider_payment_id,
    providerSubscriptionId: row.provider_subscription_id,
    providerCustomerId: row.provider_customer_id,
    providerSignature: row.provider_signature,
    providerEventType: row.provider_event_type,
    paymentMetadata: row.payment_metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
  };
}

export async function refreshUserAccess(user: AppUser) {
  if (!user.billingCycleEnd || user.plan === "free") {
    return user;
  }

  if (new Date(user.billingCycleEnd).getTime() >= Date.now()) {
    return user;
  }

  const result = await dbQuery<UserRow>(
    `update public.users
     set
       plan = 'free',
       billing_provider = 'dodo',
       billing_cycle_start = timezone('utc', now()),
       billing_cycle_end = null,
       monthly_tailors_used = 0,
       monthly_tailor_limit = 0,
       monthly_tracker_parses_used = 0,
       preferred_model_tier = 'demo',
       updated_at = timezone('utc', now())
     where id = $1
     returning *`,
    [user.id],
  );

  const updated = firstRow(result);
  return updated ? mapUser(updated) : user;
}

export function getRemainingTailors(user: AppUser) {
  if (user.plan === "free") {
    return Math.max(0, 2 - user.demoTailorsUsed);
  }

  return Math.max(0, user.monthlyTailorLimit - user.monthlyTailorsUsed);
}

export async function getMasterResumesForUser(userId: string) {
  const result = await dbQuery<MasterResumeRow>(
    `select * from public.master_resumes
     where user_id = $1
     order by is_primary desc, created_at desc`,
    [userId],
  );

  return result.rows.map(mapMasterResume);
}

export async function getTailoredResumesForUser(userId: string) {
  const result = await dbQuery<TailoredResumeRow>(
    `select
      tr.*,
      jd.company_name,
      jd.job_title
    from public.tailored_resumes tr
    left join public.job_descriptions jd on jd.id = tr.job_description_id
    where tr.user_id = $1
    order by tr.created_at desc`,
    [userId],
  );

  return result.rows.map(mapTailoredResume);
}

export async function getTailoredResumeForUser(userId: string, tailoredId: string) {
  const result = await dbQuery<TailoredResumeRow>(
    `select
      tr.*,
      jd.company_name,
      jd.job_title
    from public.tailored_resumes tr
    left join public.job_descriptions jd on jd.id = tr.job_description_id
    where tr.user_id = $1 and tr.id = $2
    limit 1`,
    [userId, tailoredId],
  );

  const row = firstRow(result);
  return row ? mapTailoredResume(row) : null;
}

export async function getJobDescriptionForUser(userId: string, jobDescriptionId: string) {
  const result = await dbQuery<{
    id: string;
    user_id: string;
    company_name: string | null;
    job_title: string | null;
    raw_text: string;
    parsed_data: JobDescriptionRecord["parsedData"];
    source_url: string | null;
    created_at: string;
    updated_at: string;
  }>(
    `select * from public.job_descriptions
     where user_id = $1 and id = $2
     limit 1`,
    [userId, jobDescriptionId],
  );

  const row = firstRow(result);
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    jobTitle: row.job_title,
    rawText: row.raw_text,
    parsedData: row.parsed_data,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies JobDescriptionRecord;
}

export async function getUsageLogForUser(userId: string, limit = 20) {
  const result = await dbQuery<UsageLogRow>(
    `select * from public.usage_log
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );

  return result.rows.map(mapUsageLog);
}

export async function getPaymentsForUser(userId: string, limit = 10) {
  const result = await dbQuery<PaymentRow>(
    `select * from public.payments
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );

  return result.rows.map(mapPayment);
}

export async function getPaymentForUserByCheckoutId(userId: string, checkoutId: string) {
  const result = await dbQuery<PaymentRow>(
    `select * from public.payments
     where user_id = $1 and provider_checkout_id = $2
     limit 1`,
    [userId, checkoutId],
  );

  const row = firstRow(result);
  return row ? mapPayment(row) : null;
}

// ── Tracked applications ──

type TrackedApplicationRow = {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  location: string | null;
  work_mode: TrackedApplicationRecord["workMode"];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  status: TrackedApplicationRecord["status"];
  priority: number;
  source_url: string | null;
  source_platform: string | null;
  raw_jd_text: string | null;
  parsed_jd_data: TrackedApplicationRecord["parsedJdData"];
  required_skills: string[];
  preferred_skills: string[];
  experience_required: string | null;
  applied_at: string | null;
  deadline_at: string | null;
  follow_up_at: string | null;
  last_activity_at: string | null;
  notes: string | null;
  contact_name: string | null;
  contact_email: string | null;
  tailored_resume_id: string | null;
  prep_resources: TrackedApplicationRecord["prepResources"];
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

function mapTrackedApplication(row: TrackedApplicationRow): TrackedApplicationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    location: row.location,
    workMode: row.work_mode,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    status: row.status,
    priority: row.priority,
    sourceUrl: row.source_url,
    sourcePlatform: row.source_platform,
    rawJdText: row.raw_jd_text,
    parsedJdData: row.parsed_jd_data,
    requiredSkills: row.required_skills ?? [],
    preferredSkills: row.preferred_skills ?? [],
    experienceRequired: row.experience_required,
    appliedAt: row.applied_at,
    deadlineAt: row.deadline_at,
    followUpAt: row.follow_up_at,
    lastActivityAt: row.last_activity_at,
    notes: row.notes,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    tailoredResumeId: row.tailored_resume_id,
    prepResources: row.prep_resources ?? [],
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTrackedApplicationsForUser(
  userId: string,
  options?: {
    status?: ApplicationStatus[];
    archived?: boolean;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
    limit?: number;
    offset?: number;
  },
): Promise<{ applications: TrackedApplicationRecord[]; total: number }> {
  const conditions: string[] = ["user_id = $1"];
  const params: unknown[] = [userId];
  let paramIndex = 2;

  const archived = options?.archived ?? false;
  conditions.push(`is_archived = $${paramIndex}`);
  params.push(archived);
  paramIndex++;

  if (options?.status && options.status.length > 0) {
    conditions.push(`status = ANY($${paramIndex}::application_status[])`);
    params.push(options.status);
    paramIndex++;
  }

  if (options?.search) {
    conditions.push(`(company_name ilike $${paramIndex} or role_title ilike $${paramIndex})`);
    params.push(`%${options.search}%`);
    paramIndex++;
  }

  const where = conditions.join(" and ");
  const allowedSorts = ["created_at", "updated_at", "company_name", "role_title", "status", "priority", "applied_at"];
  const sortCol = allowedSorts.includes(options?.sort ?? "") ? options!.sort! : "created_at";
  const sortDir = options?.order === "asc" ? "asc" : "desc";
  const limit = Math.min(options?.limit ?? 50, 200);
  const offset = options?.offset ?? 0;

  const [dataResult, countResult] = await Promise.all([
    dbQuery<TrackedApplicationRow>(
      `select * from public.tracked_applications
       where ${where}
       order by ${sortCol} ${sortDir}
       limit $${paramIndex} offset $${paramIndex + 1}`,
      [...params, limit, offset],
    ),
    dbQuery<{ count: string }>(
      `select count(*)::text as count from public.tracked_applications where ${where}`,
      params,
    ),
  ]);

  return {
    applications: dataResult.rows.map(mapTrackedApplication),
    total: parseInt(countResult.rows[0]?.count ?? "0", 10),
  };
}

export async function getTrackedApplicationForUser(
  userId: string,
  applicationId: string,
): Promise<TrackedApplicationRecord | null> {
  const result = await dbQuery<TrackedApplicationRow>(
    `select * from public.tracked_applications
     where user_id = $1 and id = $2
     limit 1`,
    [userId, applicationId],
  );
  const row = firstRow(result);
  return row ? mapTrackedApplication(row) : null;
}

export async function getActiveTrackedApplicationCount(userId: string): Promise<number> {
  const result = await dbQuery<{ count: string }>(
    `select count(*)::text as count
     from public.tracked_applications
     where user_id = $1 and is_archived = false`,
    [userId],
  );
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

export async function getTrackerStatsForUser(userId: string) {
  const result = await dbQuery<{
    total: string;
    status: string;
    status_count: string;
  }>(
    `select
       (select count(*)::text from public.tracked_applications where user_id = $1 and is_archived = false) as total,
       status::text,
       count(*)::text as status_count
     from public.tracked_applications
     where user_id = $1 and is_archived = false
     group by status`,
    [userId],
  );

  const byStatus: Record<string, number> = {};
  let total = 0;
  for (const row of result.rows) {
    total = parseInt(row.total, 10);
    byStatus[row.status] = parseInt(row.status_count, 10);
  }

  const applied = (byStatus.applied ?? 0) + (byStatus.screening ?? 0) + (byStatus.interviewing ?? 0) + (byStatus.offer ?? 0) + (byStatus.accepted ?? 0) + (byStatus.rejected ?? 0) + (byStatus.ghosted ?? 0);
  const responded = (byStatus.screening ?? 0) + (byStatus.interviewing ?? 0) + (byStatus.offer ?? 0) + (byStatus.accepted ?? 0);
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;

  return { total, byStatus, responseRate };
}

export async function getDashboardSnapshot(user: AppUser) {
  const currentUser = await refreshUserAccess(user);
  const [resumes, tailoredResumes, usageLog, trackerStats] = await Promise.all([
    getMasterResumesForUser(currentUser.id),
    getTailoredResumesForUser(currentUser.id),
    getUsageLogForUser(currentUser.id, 6),
    getTrackerStatsForUser(currentUser.id),
  ]);

  return {
    currentUser,
    resumes,
    tailoredResumes,
    usageLog,
    trackerStats,
    remainingTailors: getRemainingTailors(currentUser),
  };
}
