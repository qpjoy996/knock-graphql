const Koa = require("koa");
const app = new Koa();
const apolloServer = require("./src/graphql/index");

// 通过 schema、解析器、 Apollo Server 的构造函数，创建一个 server 实例
// const isProd = process.env.NODE_ENV === "production";
app.use(require('./src/middlewares/auth'));

// 将 server 实例以中间件的形式挂载到 app 上
apolloServer.applyMiddleware({ app,path: '/graph' });
// 启动 web 服务
app.listen({ port: 9041 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000/graphql`)
);
