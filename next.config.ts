import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle these in the server output; load from node_modules at runtime (reduces function size)
  serverExternalPackages: ["@prisma/client", "bcryptjs", "jose", "pdf-lib", "resend", "sanitize-html"],
};

export default nextConfig;
