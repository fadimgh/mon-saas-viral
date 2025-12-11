/** @type {import('next').NextConfig} */
const nextConfig = {
    // On garde juste la limite de taille pour éviter les fichiers géants
    experimental: {
        serverActions: {
            bodySizeLimit: '4mb',
        },
    },
};

export default nextConfig;