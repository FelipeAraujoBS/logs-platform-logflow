import { Db } from "mongodb";
import { FastifyInstance } from "fastify";

export function registerWebSocket(app: FastifyInstance, db: Db): void {
  app.get("/api/v1/logs/stream", { websocket: true }, async (socket) => {
    console.log("Cliente WebSocket conectado");

    let lastTimestamp = new Date();

    const interval = setInterval(async () => {
      try {
        const logs = await db
          .collection("logs")
          .find({ timestamp: { $gt: lastTimestamp.toISOString() } })
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray();

        if (logs.length > 0) {
          lastTimestamp = new Date();
          logs.forEach((log) => socket.send(JSON.stringify(log)));
        }
      } catch (error) {
        console.error("Erro no polling:", error);
      }
    }, 2000);

    socket.on("close", () => {
      console.log("Cliente WebSocket desconectado");
      clearInterval(interval);
    });

    socket.on("error", (error: Error) => {
      console.error("Erro no WebSocket:", error);
      clearInterval(interval);
    });
  });
}
