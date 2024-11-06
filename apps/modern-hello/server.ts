import * as grpc from "@grpc/grpc-js";
import { addGrpcService } from "./connect-node-extra/add-grpc-service";
import logger from "./logger";
import { ChatService } from "./types/protos/chat_connectweb";

const streamMessages = {
  streamMessages: (call) => {
    logger.grpcLogger.info("New client connected");

    // Simulando envio de mensagens periódicas
    const interval = setInterval(() => {
      const message = {
        content: `Message at ${new Date().toISOString()}`,
        sender: "Server",
        threadId: "test-thread",
        timestamp: new Date().toISOString(),
      };

      call.write(message);
      logger.grpcLogger.info("Sent message:", message);
    }, 500);

    // Ainda mantemos o listener para mensagens do cliente
    call.on("data", (request) => {
      logger.grpcLogger.info("Received message from client:", request);

      // Você pode processar a mensagem do cliente aqui se necessário
      call.write({
        content: `Server received: ${request.content}`,
        sender: "Server",
        threadId: request.threadId,
        timestamp: new Date().toISOString(),
      });
    });

    call.on("end", () => {
      clearInterval(interval);
      call.end();
      logger.grpcLogger.info("Client disconnected");
    });

    call.on("error", (error) => {
      clearInterval(interval);
      logger.grpcLogger.error("Stream error:", error);
    });
  },
};

function main() {
  const server = new grpc.Server();

  addGrpcService(server, ChatService, streamMessages);
  logger.grpcLogger.info("binding streamMessages to server");

  server.bindAsync(
    "0.0.0.0:50052",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        logger.error(err);
        return;
      }
      server.start();
      logger.info("Grpc Server ready - started server on 0.0.0.0:50052");
    },
  );
}

main();
