import { Server } from "socket.io";

let io;

/*
|------------------------------------------------------------------
| INITIALIZE SOCKET SERVER
|------------------------------------------------------------------
*/

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ User Connected:", socket.id);

    /*
    |------------------------------------------------------------------
    | JOIN ORDER ROOM (for customers & partners)
    |------------------------------------------------------------------
    */

    socket.on("join-order-room", (orderId) => {
      socket.join(orderId);
      console.log(`📦 Joined Order Room: ${orderId}`);
    });

    /*
    |------------------------------------------------------------------
    | JOIN PARTNER ROOM (for partner-specific events)
    |------------------------------------------------------------------
    */

    socket.on("join-partner-room", (partnerId) => {
      socket.join(partnerId);
      console.log(`🛵 Partner ${partnerId} joined their room`);
    });

    /*
    |------------------------------------------------------------------
    | DELIVERY LOCATION UPDATE
    |------------------------------------------------------------------
    */

    socket.on("delivery-location-update", (data) => {
      io.to(data.orderId).emit("live-location-updated", data);
    });

    /*
    |------------------------------------------------------------------
    | DISCONNECT
    |------------------------------------------------------------------
    */

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);
    });
  });
};

/*
|------------------------------------------------------------------
| GET IO INSTANCE
|------------------------------------------------------------------
*/

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};