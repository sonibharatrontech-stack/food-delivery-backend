import { createClient } from "redis";

// REDIS CLIENT
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// CONNECT
redisClient.on("connect", () => {
  console.log("Redis Connected Successfully");
});

// READY
redisClient.on("ready", () => {
  console.log("Redis Ready To Use");
});

// ERROR
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

// ======================================================
// CONNECT REDIS
// ======================================================

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.log("Redis Connection Failed:", error.message);
  }
};

export default redisClient;
