import type { NextConfig } from "next";
const config: NextConfig = {
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  devIndicators: false,
  experimental: process.platform === 'win32' ? {cpus:1,workerThreads:true,webpackBuildWorker:false} : undefined,
};
export default config;
