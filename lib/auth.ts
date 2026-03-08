import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppUser } from "@/lib/types";
import { dbQuery, firstRow } from "@/lib/db";

const SESSION_COOKIE_NAME = "applyx_session";
const SESSION_TTL_DAYS = 30;

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  plan: AppUser["plan"];
  billing_cycle_start: string;
  billing_cycle_end: string | null;
  demo_tailors_used: number;
  monthly_tailors_used: number;
  monthly_tailor_limit: number;
  preferred_model_tier: AppUser["preferredModelTier"];
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  password_hash: string;
};

function toAppUser(row: Omit<UserRow, "password_hash">): AppUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    location: row.location,
    plan: row.plan,
    billingCycleStart: row.billing_cycle_start,
    billingCycleEnd: row.billing_cycle_end,
    demoTailorsUsed: row.demo_tailors_used,
    monthlyTailorsUsed: row.monthly_tailors_used,
    monthlyTailorLimit: row.monthly_tailor_limit,
    preferredModelTier: row.preferred_model_tier,
    razorpayCustomerId: row.razorpay_customer_id,
    razorpaySubscriptionId: row.razorpay_subscription_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionForUser(
  userId: string,
  options?: {
    ipAddress?: string | null;
    userAgent?: string | null;
  },
) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await dbQuery(
    `insert into public.sessions (
      user_id,
      session_token_hash,
      expires_at,
      ip_address,
      user_agent
    ) values ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt.toISOString(), options?.ipAddress ?? null, options?.userAgent ?? null],
  );

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function createUserAccount(input: {
  fullName: string;
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = await dbQuery<{ id: string }>(
    "select id from public.users where lower(email) = lower($1)",
    [input.email],
  );

  if (existing.rowCount) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const created = await dbQuery<UserRow>(
    `insert into public.users (
      full_name,
      email,
      password_hash,
      plan,
      preferred_model_tier,
      monthly_tailor_limit
    ) values ($1, $2, $3, 'free', 'demo', 0)
    returning *`,
    [input.fullName, input.email.toLowerCase(), passwordHash],
  );

  const user = firstRow(created);
  if (!user) {
    throw new Error("Failed to create account.");
  }

  await setSessionForUser(user.id, input);
  await dbQuery(
    `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
     values ($1, 'login', 'free', 'demo', $2::jsonb)`,
    [user.id, JSON.stringify({ source: "signup" })],
  );

  return toAppUser(user);
}

export async function signInUser(input: {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const result = await dbQuery<UserRow>(
    "select * from public.users where lower(email) = lower($1)",
    [input.email],
  );
  const user = firstRow(result);

  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new Error("Invalid email or password.");
  }

  await setSessionForUser(user.id, input);
  await dbQuery(
    `insert into public.usage_log (user_id, action, plan_tier, model_tier, metadata)
     values ($1, 'login', $2, $3, $4::jsonb)`,
    [
      user.id,
      user.plan,
      user.preferred_model_tier,
      JSON.stringify({ source: "login" }),
    ],
  );

  return toAppUser(user);
}

export async function signOutUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await dbQuery(
      "delete from public.sessions where session_token_hash = $1",
      [hashSessionToken(token)],
    );
  }

  cookies().delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const result = await dbQuery<Omit<UserRow, "password_hash">>(
    `select
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.location,
      u.plan,
      u.billing_cycle_start,
      u.billing_cycle_end,
      u.demo_tailors_used,
      u.monthly_tailors_used,
      u.monthly_tailor_limit,
      u.preferred_model_tier,
      u.razorpay_customer_id,
      u.razorpay_subscription_id,
      u.created_at,
      u.updated_at
    from public.sessions s
    join public.users u on u.id = s.user_id
    where s.session_token_hash = $1
      and s.expires_at > timezone('utc', now())
    limit 1`,
    [hashSessionToken(token)],
  );

  const user = firstRow(result);

  if (!user) {
    cookies().delete(SESSION_COOKIE_NAME);
    return null;
  }

  return toAppUser(user);
}

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
