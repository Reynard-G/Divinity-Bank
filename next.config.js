/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    authInterrupts: true,
    useLightningcss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crafthead.net",
        port: "",
        pathname: "/avatar/**",
      },
      {
        protocol: "https",
        hostname: "imgs.divinity.milklegend.xyz",
        port: "",
        pathname: "/**",
      },
    ],
    loader: "custom",
    loaderFile: "./src/lib/utils/cloudflare-image-loader.js",
  },
};

export default nextConfig;
