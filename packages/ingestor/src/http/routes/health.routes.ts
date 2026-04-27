import { timeStamp } from "console";
import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (req, res) => {
    return res.status(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
}
