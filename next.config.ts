import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // defuddle/linkedom은 번들하지 않고 Node에서 그대로 로드한다.
  serverExternalPackages: ["defuddle", "linkedom"],
};

export default nextConfig;
