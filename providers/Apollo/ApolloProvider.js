const { ServiceProvider } = require("@adonisjs/fold");
const { ApolloServer } = require("adonis-apollo2");
const { makeExecutableSchema } = require("graphql-tools");
const {
  fileLoader,
  mergeTypes,
  mergeResolvers
} = require("merge-graphql-schemas");

class ApolloProvider extends ServiceProvider {
  register() {
    // register bindings
  }

  boot() {
    const Route = use("Route");
    const config = use("Config");
    const Server = use("Server");

    const typeDefs = mergeTypes(
      fileLoader(config.get("graphql.schema"), { recursive: true })
    );
    const resolvers = mergeResolvers(
      fileLoader(config.get("graphql.resolvers"))
    );
    // const schema = makeExecutableSchema({ typeDefs, resolvers });
    // const options = config.get("graphql.options");
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req, connection }) => {
        if (!req || !req.headers) {
          return;
        }

        return { authorized: true };
      },
      tracing: true
    });
    // server.installSubscriptionHandlers(Server);
    server.registerRoutes({
      router: Route,
      disableHealthCheck: false,
      onHealthCheck: ctx => {
        console.log("======= ctx", ctx);
        return Promise.reject();
      }
    });
    // this.app.singleton("ApolloProvider", () => {
    //   console.log("Apollo from my provider");
    //   const server = new ApolloServer({
    //     typeDefs,
    //     resolvers
    //     }
    //   });
    //   server.registerRoutes({ router: Route });
    //   return server;
    // });
  }
}

module.exports = ApolloProvider;
