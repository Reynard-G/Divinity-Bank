import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 5 requests per 60 seconds
export const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  timeout: 1000, // 1 second
  prefix: "@upstash/ratelimit",
  analytics: true,
  enableProtection: true,
});
