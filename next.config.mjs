/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/gallery/**",
      },
    ],
  },
};

export default nextConfig;
