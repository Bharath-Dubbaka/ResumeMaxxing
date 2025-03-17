/** @type {import('next').NextConfig} */
const nextConfig = {
   headers: () => [
      {
         source: "/(.*)",
         headers: [
            {
               key: "Content-Security-Policy",
               value: `script-src 'self' https://www.googletagmanager.com 'unsafe-inline'`,
            },
         ],
      },
   ],
};
export default nextConfig;
