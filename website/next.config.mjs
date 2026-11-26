/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/hdl',
        destination: '/part-a',
        permanent: true,
      },
      {
        source: '/architecture',
        destination: '/part-a',
        permanent: true,
      },
      {
        source: '/assembler',
        destination: '/part-b',
        permanent: true,
      },
      {
        source: '/box',
        destination: '/part-c',
        permanent: true,
      },
      {
        source: '/simulator',
        destination: '/part-c',
        permanent: true,
      },
      {
        source: '/downloads',
        destination: '/submission',
        permanent: true,
      },
      {
        source: '/documentation',
        destination: '/submission',
        permanent: true,
      },
      {
        source: '/testing',
        destination: '/submission',
        permanent: true,
      },
      {
        source: '/viva',
        destination: '/submission',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
