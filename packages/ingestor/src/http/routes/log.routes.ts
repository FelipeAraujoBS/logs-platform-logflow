import { FastifyInstance } from "fastify";
import { HttpLogPayload } from "@log-platform/shared";
import { logSchema } from "../schemas/log.schema";
import { normalizeHttp } from "../../normalizer/log.normalizer";
import { pushToQueue } from "../../queue/producer";

export async function logRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: HttpLogPayload }>(
    "/logs",
    { schema: logSchema },
    async (req, res) => {
      const entry = normalizeHttp(req.body);
      await pushToQueue(entry);
      return res.status(202).send({ id: entry.id });
    }
  );
}
