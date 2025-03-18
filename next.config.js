/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add webpack configuration to handle node modules
  webpack: (config, { isServer }) => {
    // Handle certain node modules that aren't needed in the browser
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        // Add any other Node.js modules that cause issues
        path: false,
        os: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
