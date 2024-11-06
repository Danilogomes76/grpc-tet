import * as grpc from "@grpc/grpc-js";
import express from "express";

import { createGrpcClient } from "./connect-node-extra/create-grpc-client";
import logger from "./logger";
import { ChatService } from "./types/protos/chat_connectweb";
import { createGrpcServiceDefinition } from "./connect-node-extra/create-grpc-definition";

// const definition = createGrpcServiceDefinition(ChatService);

// const grpcClientCtor = grpc.makeGenericClientConstructor(
//   definition,
//   ChatService.typeName,
// );

// const client = new grpcClientCtor(
//   "0.0.0.0:50052",
//   grpc.ChannelCredentials.createInsecure(),
//   {},
// ) as unknown;

const client = createGrpcClient(ChatService, {
  address: "0.0.0.0:50052",
  channelCredentials: grpc.ChannelCredentials.createInsecure(),
  clientOptions: {},
  binaryOptions: {},
});

const app = express();
app.disable("x-powered-by");

app.use(express.json());

// app.get("/", (req, res) => {
//   const content = String(req.query?.content ?? "Ola");
//   const sender = String(req.query?.content ?? "Danilo");
//   const threadId = String(req.query?.content ?? "123");
//   const timestamp = String(req.query?.content ?? "now");

//   client.streamMessages(
//     { content, sender, threadId, timestamp },
//     (err, response) => {
//       if (err) {
//         throw err;
//       }
//       logger.apiLogger.info("Greeting:", response?.content);
//       res.json(response);
//     },
//   );
// });

app.post("/teste-grpc", (req, res) => {
  const { content, sender, threadId, timestamp } = req.body;

  const call = client.streamMessages();

  call.write({ content, sender, threadId, timestamp }, (err, response) => {
    res.json({ message: "Enviado" });
  });

  // Escuta as mensagens recebidas do servidor
  // call.on("data", (response) => {
  //   console.log("Recebido do servidor:", response.message);
  //   logger.apiLogger.info("Recebido do servidor:", response.message);
  // });

  // // Trata o fechamento do stream pelo servidor
  // call.on("end", () => {
  //   console.log("Stream finalizado pelo servidor.");
  // });

  // // Trata erros no stream
  // call.on("error", (error) => {
  //   console.error("Erro no stream:", error.message);
  // });

  // // Envia a primeira mensagem
  // call.write({ content, sender, threadId, timestamp });

  // // Envia mensagens adicionais, se necessário
  // setTimeout(() => {
  //   call.write({ content: "Outra mensagem", sender, threadId, timestamp });
  // }, 2000);

  // // Encerra a escrita no stream após alguns segundos
  // setTimeout(() => {
  //   call.end();
  //   res.json({ status: "Mensagens enviadas no stream" });
  // }, 50000);
});

const PORT = 3002;
app.listen(PORT, () => {
  logger.info(
    "Client Server listening to port %d, url: http://localhost:%d",
    PORT,
    PORT,
  );
});
