import { buildServer } from "./http/server";
import { startGrpcServer } from "./grpc/server";
import { env } from "./config/env";

async function main(): Promise<void> {
  try {
    const app = await buildServer();

    await app.listen({
      port: env.http.port,
      host: "0.0.0.0",
    });

    startGrpcServer();

    console.log(`HTTP server rodando na porta ${env.http.port}`);
    console.log(`gRPC server rodando na porta ${env.grpc.port}`);
  } catch (error) {
    console.error("Erro ao inicializar o ingestor", error);
    process.exit(1);
  }
}

main();
