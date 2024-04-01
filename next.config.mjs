import NextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default withBundleAnalyzer(nextConfig);
