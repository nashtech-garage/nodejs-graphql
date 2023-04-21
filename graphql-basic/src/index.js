import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { resolvers, typeDefs } from "./resolver";

//Initialize server
const server = new ApolloServer({
  typeDefs,
  resolvers
});
const port = 3000;

const main = async () => {
  // Launch the server
  const { url } = await startStandaloneServer(server, {
    listen: {
      port
    }
  });

  console.log(`🚀 Server listening at: ${url}`);
};

main();
