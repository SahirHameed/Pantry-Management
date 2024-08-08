import "dotenv/config";

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_OPENAI_KEY: process.env.NEXT_PUBLIC_OPENAI_KEY,
  },
};

export default nextConfig;
