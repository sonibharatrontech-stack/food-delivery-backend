import { createClient } from "redis";

// REDIS CLIENT
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// ERROR
redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

// CONNECT
redisClient.on("connect", () => {
  console.log("Redis Connected Successfully");
});

// READY
redisClient.on("ready", () => {
  console.log("Redis Ready To Use");
});

await redisClient.connect();

export default redisClient;
