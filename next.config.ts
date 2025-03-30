import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  reactStrictMode: false,

images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com'
    },
    {
      protocol: 'https',
      hostname: 'avatars.githubusercontent.com'
    }
  ]
}
};

export default nextConfig;
