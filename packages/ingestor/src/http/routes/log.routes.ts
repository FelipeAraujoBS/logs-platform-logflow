import { FastifyInstance } from "fastify";
import { HttpLogPayload } from "@log-platform/shared";
import { logSchema } from "../schemas/log.schema";
import { normalizeHttp } from "../../normalizer/log.normalizer";
import { pushToQueue } from "../../queue/producer";
import { getLogsReceivedCounter } from "../server";

export async function logRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: HttpLogPayload }>(
    "/logs",
    { schema: logSchema },
    async (req, res) => {
      try {
        const entry = normalizeHttp(req.body);
        await pushToQueue(entry);
        getLogsReceivedCounter().inc({ protocol: "http" });
        return res.status(202).send({ id: entry.id });
      } catch (error) {
        req.log.error(error, "Failed to push log to queue");
        return res.status(500).send({ error: "Failed to ingest log" });
      }
    }
  );
}
