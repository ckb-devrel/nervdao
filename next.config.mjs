/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    useTypeScriptCli: false,
  },
};

export default nextConfig;
