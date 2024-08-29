import nodeExternals from 'webpack-node-externals';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: true,
};

export default nextConfig;
