import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { notifyApplicationApplied } from "@/lib/notifications/openclaw";
import { toErrorResponse } from "@/lib/security/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import type { ApplicationStatus } from "@/lib/types";

export const runtime = "nodejs";

const updateSchema = z.object({
  companyName: z.string().max(200).optional(),
  roleTitle: z.string().max(200).optional(),
  status: z
    .enum([
      "bookmarked", "applying", "applied", "screening",
      "interviewing", "offer", "accepted", "rejected",
      "withdrawn", "ghosted",
    ])
    .optional(),
  priority: z.number().min(0).max(5).optional(),
  location: z.string().max(200).nullable().optional(),
  workMode: z.enum(["remote", "hybrid", "onsite", "unknown"]).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  deadlineAt: z.string().nullable().optional(),
  followUpAt: z.string().nullable().optional(),
  contactName: z.string().max(200).nullable().optional(),
  contactEmail: z.string().max(200).nullable().optional(),
  sourceUrl: z.string().max(2000).nullable().optional(),
  sourcePlatform: z.string().max(100).nullable().optional(),
  isArchived: z.boolean().optional(),
  followedUp: z.boolean().optional(),
});

const fieldMap: Record<string, string> = {
  companyName: "company_name",
  roleTitle: "role_title",
  status: "status",
  priority: "priority",
  location: "location",
  workMode: "work_mode",
  salaryMin: "salary_min",
  salaryMax: "salary_max",
  notes: "notes",
  appliedAt: "applied_at",
  deadlineAt: "deadline_at",
  followUpAt: "follow_up_at",
  contactName: "contact_name",
  contactEmail: "contact_email",
  sourceUrl: "source_url",
  sourcePlatform: "source_platform",
  isArchived: "is_archived",
  followedUp: "followed_up",
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:update",
      identifier: sessionUser.id,
      limit: 30,
      windowSeconds: 60,
      message: "Tracker update rate limit reached. Please wait a minute and try again.",
    });

    const existingResult = await dbQuery<{
      id: string;
      company_name: string;
      role_title: string;
      status: ApplicationStatus;
      source_url: string | null;
      applied_at: string | null;
    }>(
      `select id, company_name, role_title, status::text, source_url, applied_at
       from public.tracked_applications
       where id = $1 and user_id = $2
       limit 1`,
      [params.id, sessionUser.id],
    );
    const existing = existingResult.rows[0];

    if (!existing) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const payload = updateSchema.parse(await request.json());
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;
      const col = fieldMap[key];
      if (!col) continue;

      if (col === "status") {
        setClauses.push(`${col} = $${paramIndex}::application_status`);
      } else if (col === "work_mode") {
        setClauses.push(`${col} = $${paramIndex}::work_mode`);
      } else {
        setClauses.push(`${col} = $${paramIndex}`);
      }
      values.push(value);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    if (payload.status === "applied" && payload.appliedAt === undefined) {
      setClauses.push("applied_at = coalesce(applied_at, timezone('utc', now()))");
    }

    if (payload.status === "applied" && payload.followUpAt === undefined) {
      setClauses.push(
        "follow_up_at = coalesce(follow_up_at, timezone('utc', now()) + interval '7 days')",
      );
    }

    const result = await dbQuery<{
      id: string;
      company_name: string;
      role_title: string;
      status: ApplicationStatus;
      source_url: string | null;
      applied_at: string | null;
    }>(
      `update public.tracked_applications
       set ${setClauses.join(", ")}
       where id = $${paramIndex} and user_id = $${paramIndex + 1}
       returning id, company_name, role_title, status::text, source_url, applied_at`,
      [...values, params.id, sessionUser.id],
    );

    const updated = result.rows[0];

    if (!updated) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    if (existing.status !== "applied" && updated.status === "applied") {
      await notifyApplicationApplied({
        applicationId: updated.id,
        userId: sessionUser.id,
        userEmail: sessionUser.email,
        userName: sessionUser.fullName,
        companyName: updated.company_name || existing.company_name || "Unknown company",
        roleTitle: updated.role_title || existing.role_title || "Untitled role",
        sourceUrl: updated.source_url ?? existing.source_url,
        appliedAt: updated.applied_at ?? new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to update that application right now.",
      logLabel: "api/applications/update",
    });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await enforceRateLimit({
      key: "tracker:delete",
      identifier: sessionUser.id,
      limit: 20,
      windowSeconds: 60,
      message: "Tracker delete rate limit reached. Please wait a minute and try again.",
    });

    const result = await dbQuery(
      `delete from public.tracked_applications
       where id = $1 and user_id = $2`,
      [params.id, sessionUser.id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, {
      fallbackMessage: "Unable to delete that application right now.",
      logLabel: "api/applications/delete",
    });
  }
}
