/** @type {import('next').NextConfig} */
const path = require('path');
const os = require('os');

const nextConfig = {
  reactStrictMode: true,
  // Store build cache in OS temp directory (always outside OneDrive).
  // This permanently prevents EINVAL readlink errors on Windows.
  distDir: path.join(os.tmpdir(), 'campus-intel-360-build'),
}

module.exports = nextConfig
