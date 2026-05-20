import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin output tracing + Turbopack root so Next doesn't pick up the parent
  // C:\Users\palmz\package-lock.json as workspace root.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
