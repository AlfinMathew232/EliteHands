/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'elitehands.ca',
      },
    ],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
