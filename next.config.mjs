/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'aceaspades.com',
          },
        ],
      },
};

export default nextConfig;
