import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
