"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  sanitizeNextPath,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";

function redirectWithMessage(
  path: "/login" | "/signup",
  key: "error" | "success",
  message: string,
): never {
  const searchParams = new URLSearchParams({ [key]: message });
  redirect(`${path}?${searchParams.toString()}`);
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    redirectWithMessage("/signup", "error", parsed.error.issues[0]?.message ?? "Invalid sign up details.");
  }

  const values = parsed.data;
  const supabase = createClient();
  const next = sanitizeNextPath(values.next);

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirectWithMessage("/signup", "error", error.message);
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(next);
  }

  redirectWithMessage(
    "/signup",
    "success",
    "Account created. Check your email to confirm your signup before continuing.",
  );
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    redirectWithMessage("/login", "error", parsed.error.issues[0]?.message ?? "Invalid sign in details.");
  }

  const values = parsed.data;
  const supabase = createClient();
  const next = sanitizeNextPath(values.next);

  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    redirectWithMessage("/login", "error", error.message);
  }

  revalidatePath("/", "layout");
  redirect(next);
}
