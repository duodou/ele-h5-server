const path = require('path');
const jsonServer = require('json-server');
const router = require('./router');
const TokenService = require('./service/token');
const db = require('./db')();
const server = jsonServer.create();

const middlewres = jsonServer.defaults({
  static: path.join(__dirname, '../public'),
});

server.use(middlewres);
server.use(jsonServer.bodyParser);

//鉴权
server.use((req, res, next) => {
  if (TokenService.isAuthorized(req)) {
    next();
  } else {
    res.sendStatus(401);
  }
});
server.use((req, res, next) => {
  const json = res.json.bind(res);
  res.success = (data) => {
    return json({
      code: 0,
      msg: '请求成功',
      data,
    });
  };
  res.fail = (msg = '请求失败', code = -1, data) => {
    return json({
      code,
      msg,
      data,
    });
  };
  next();
});

router(server);

const jsonRouter = jsonServer.router(db);

server.use((req, res, next) => {
  setTimeout(next, 1000);
});

server.use('/api', jsonRouter);
server.listen(9999, () => {
  console.log('server running in ', new Date());
});
