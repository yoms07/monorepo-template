import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['__PACKAGE_SCOPE__/shared'],
  reactStrictMode: true,
};

export default nextConfig;
