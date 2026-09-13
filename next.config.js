/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

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
              "img-src 'self' http://localhost:3000 http://localhost:4400 data: blob: https:",

              // API + WebSocket connections (LOCAL DEVELOPMENT)
              "connect-src 'self' http://localhost:4400 ws://localhost:4400 https://yookatale-server.onrender.com https://yookatale-server-app.onrender.com wss://yookatale-server.onrender.com",

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
