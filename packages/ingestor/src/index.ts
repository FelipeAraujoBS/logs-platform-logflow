import { buildServer } from "./http/server";
import { buildGrpcServer, startGrpcServer } from "./grpc/server";
import { env } from "./config/env";

async function main(): Promise<void> {
  try {
    const app = await buildServer();

    await app.listen({
      port: env.http.port,
      host: "0.0.0.0",
    });

    const grpcServer = buildGrpcServer();
    startGrpcServer(grpcServer);

    app.log.info(`HTTP server rodando na porta ${env.http.port}`);
    app.log.info(`gRPC server rodando na porta ${env.grpc.port}`);

    const shutdown = async () => {
      app.log.info("Encerrando ingestor...");
      await app.close();
      grpcServer.forceShutdown();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Erro ao inicializar o ingestor", error);
    process.exit(1);
  }
}

main();
