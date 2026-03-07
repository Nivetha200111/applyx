import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: {
    db,
    type: "postgres",
  },
  baseURL: process.env.BETTER_AUTH_URL ?? getSiteUrl(),
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "replace-this-better-auth-secret-before-production",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : {},
  plugins: [nextCookies()],
});
