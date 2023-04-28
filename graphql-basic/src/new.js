import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import { ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";
import { resolvers, typeDefs } from "./resolver.js";

const PORT = 4000;
const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql"
});
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    },
    ApolloServerPluginLandingPageProductionDefault({
      embed: {
        endpointIsEditable: true
      }
    })
  ]
});

server.start().then(() => {
  app.use(cors(), bodyParser.json());
  app.use("/graphql", expressMiddleware(server));
  httpServer.listen(PORT, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${PORT}/graphql`);
    console.log(
      `🚀 Subscription endpoint ready at ws://localhost:${PORT}/graphql`
    );
  });
});
