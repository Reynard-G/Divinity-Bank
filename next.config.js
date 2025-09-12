/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'crafatar.com',
        port: '',
        pathname: '/avatars/**',
      },
      {
        protocol: 'https',
        hostname: 'imgs.divinity.milklegend.xyz',
        port: '',
        pathname: '/**',
      },
    ],
    loader: 'custom',
    loaderFile: './cloudflare-image-loader.js',
  },
};

export default nextConfig;