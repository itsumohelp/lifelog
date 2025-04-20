import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

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

export default withFlowbiteReact(nextConfig);