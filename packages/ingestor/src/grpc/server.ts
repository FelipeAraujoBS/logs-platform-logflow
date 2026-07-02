import path from "path";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ingestLogHandler } from "./handlers/log.handler";
import { env } from "../config/env";

const PROTO_PATH = path.resolve(__dirname, "../../proto/log.proto");

function withAuth(
  handler: (call: any, callback: any) => Promise<void>
): (call: any, callback: any) => Promise<void> {
  return async (call, callback) => {
    const metadata = call.metadata.get("authorization");
    const token = metadata.length > 0 ? metadata[0].toString() : "";
    if (!token.startsWith("Bearer ") || token.slice(7) !== env.apiKey) {
      return callback({ code: grpc.status.UNAUTHENTICATED, message: "Unauthorized" });
    }
    return handler(call, callback);
  };
}

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
    ingestLog: withAuth(ingestLogHandler),
  });

  return server;
}

export function startGrpcServer(server: grpc.Server): void {
  server.bindAsync(
    `0.0.0.0:${env.grpc.port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) throw error;
      console.log(`gRPC server rodando na porta ${port}`);
    }
  );
}
