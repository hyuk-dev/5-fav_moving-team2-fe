import type { NextConfig } from 'next';

const backend = process.env.API_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    return {
      beforeFiles: [
        // customer API
        { source: '/api/quotation/customer', destination: `${backend}/api/quotation/customer` },
        { source: '/api/receivedQuo/customer/pending', destination: `${backend}/api/receivedQuo/customer/pending` },
        { source: '/api/receivedQuo/customer/completed', destination: `${backend}/api/receivedQuo/customer/completed` },
        {
          source: '/api/receivedQuo/customer/pending/:offerId',
          destination: `${backend}/api/receivedQuo/customer/pending/:offerId`,
        },
        { source: '/api/review/customer/offer', destination: `${backend}/api/review/customer/offer` },
        { source: '/api/review/customer/:customerId', destination: `${backend}/api/review/customer/:customerId` },
        { source: '/api/review/customer/offer/:offerId', destination: `${backend}/api/review/customer/offer/:offerId` },

        // mover 견적 관련
        { source: '/api/quotation/mover', destination: `${backend}/api/quotation/mover` },
        { source: '/api/quotation/mover/sent', destination: `${backend}/api/quotation/mover/sent` },
        { source: '/api/quotation/mover/sent/:id', destination: `${backend}/api/quotation/mover/sent/:id` },
        { source: '/api/quotation/mover/count', destination: `${backend}/api/quotation/mover/count` },

        // mover 배정/거절 관련
        { source: '/api/assignMover/:moverId', destination: `${backend}/api/assignMover/:moverId` },
        { source: '/api/assignMover/reject', destination: `${backend}/api/assignMover/reject` },
        { source: '/api/assignMover', destination: `${backend}/api/assignMover` },

        // mover 상세/리뷰 조회
        { source: '/api/mover', destination: `${backend}/api/mover` },
        { source: '/api/mover/:moverId', destination: `${backend}/api/mover/:moverId` },
        { source: '/api/review/:moverId', destination: `${backend}/api/review/:moverId` },

        // 찜 기능 (like)
        { source: '/api/like/customer', destination: `${backend}/api/like/customer` },
        { source: '/api/like/:moverId/customer', destination: `${backend}/api/like/:moverId/customer` },

        // 알림(Notification)
        { source: '/api/notifications', destination: `${backend}/api/notifications` },
        { source: '/api/notifications/:id/read', destination: `${backend}/api/notifications/:id/read` },

        // 프로필 수정 및 조회
        { source: '/api/profile/mover/info', destination: `${backend}/api/profile/mover/info` },
        { source: '/api/profile/mover', destination: `${backend}/api/profile/mover` },
        { source: '/api/profile/customer', destination: `${backend}/api/profile/customer` },
        { source: '/api/profile/:userType', destination: `${backend}/api/profile/:userType` },

        // 인증 (OAuth & 일반)
        { source: '/api/auth/:provider/:userType/login', destination: `${backend}/api/auth/:provider/:userType/login` },
        { source: '/api/auth/:userType/:action(login|signup)', destination: `${backend}/api/auth/:userType/:action` },
        { source: '/api/auth/logout', destination: `${backend}/api/auth/logout` },
      ],
      fallback: [{ source: '/api/:path*', destination: `${backend}/api/:path*` }],
    };
  },
};

export default nextConfig;
