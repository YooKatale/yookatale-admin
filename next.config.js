/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://yookatale-serverside.onrender.com"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/admin/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },

          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              // Scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",

              // Styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Fonts
              "font-src 'self' https://fonts.gstatic.com",

              // Images
              "img-src 'self' data: blob: https:",

              // API + WebSocket connections (LOCAL DEVELOPMENT)
              "connect-src 'self' https://yookatale-serverside.onrender.com wss://yookatale-serverside.onrender.com",

              // Prevent embedding
              "frame-ancestors 'none'",
            ].join("; "),
          },

          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },

          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
