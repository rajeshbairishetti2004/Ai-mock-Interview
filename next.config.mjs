/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverComponentsExternalPackages: ['pdf2json', 'mammoth']
    }
};

export default nextConfig;
