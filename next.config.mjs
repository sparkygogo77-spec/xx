/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle missing pino-pretty module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
    }
    
    // Ignore pino-pretty in client-side bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      }
    }
    
    return config
  },
}

export default nextConfig
