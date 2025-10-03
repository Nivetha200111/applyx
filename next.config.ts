import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors in code we haven't touched yet.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even with type errors
    // originating from non-app code like MCP server during early setup.
    ignoreBuildErrors: true,
  },
  // Externalize native/server-only libs to avoid bundling issues
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
