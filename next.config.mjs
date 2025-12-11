/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  // On augmente la limite de taille pour l'API (juste au cas où)
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default nextConfig;