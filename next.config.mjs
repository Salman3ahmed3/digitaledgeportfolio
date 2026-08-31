/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // TODO(user): Add remote image domains here if you serve images from a CDN.
    // remotePatterns: [{ protocol: "https", hostname: "your-cdn.com" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
