import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ingestLogHandler } from "./handlers/log.handler";
import { env } from "../config/env";

const PROTO_PATH = path.resolve(__dirname, "../../proto/log.proto");

export function buildGrpcServer(): grpc.Server {
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: false,
    longs: Number,
    enums: String,
    defaults: true,
    oneofs: true,
  });

  const proto = grpc.loadPackageDefinition(packageDefinition) as any;

  const server = new grpc.Server();

  server.addService(proto.log.LogService.service, {
    ingestLog: ingestLogHandler,
  });

  return server;
}

export function startGrpcServer(): void {
  const server = buildGrpcServer();

  server.bindAsync(
    `0.0.0.0:${env.grpc.port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) throw error;
      console.log(`gRPC server rodando na porta ${port}`);
    }
  );
}
