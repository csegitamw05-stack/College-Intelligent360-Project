/** @type {import('next').NextConfig} */
const path = require('path');
const os = require('os');

const isWindows = process.platform === 'win32';

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Use temp directory for build cache only during local Windows development
  ...(isWindows && process.env.NODE_ENV !== 'production' ? {
    distDir: path.join(os.tmpdir(), 'campus-intel-360-build'),
  } : {}),
};

module.exports = nextConfig;
