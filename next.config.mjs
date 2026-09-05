/** @type {import('next').NextConfig} */
const nextConfig = {
  // 外链图片（一言/图库）直接原图渲染，避免 next/image 要求为每个图床配置 remotePatterns
  images: { unoptimized: true },
};

export default nextConfig;
