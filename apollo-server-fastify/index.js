const app = require('fastify')();
const apolloServer = require("./src/graphql/index");
 
(async function () {
  app.register(apolloServer.createHandler());
  await app.listen(3000, '0.0.0.0');
})();