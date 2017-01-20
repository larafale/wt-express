"use latest";

const app = new (require('express'))();
const wt = require('webtask-tools');

const err = (err, statusCode = 500) => ({
  statusCode,
  err: (err && err.message) || err || 'oups ! try again.'
})

const ok = (item, statusCode = 200) => ({
  statusCode,
  item
})

app.use((require('body-parser')).json());
app.use((req, res, next) => {
  res.err = (err, statusCode) => res.json(err(err, statusCode));
  res.ok = (item, statusCode) => res.json(ok(item, statusCode));
  next();
})

app.get('/', function (req, res) {
  res.ok({app: 'rocking'});
});

app.get('/stars', function (req, res) {
  req.webtaskContext.storage.get((err, data) => {
    if(err) return res.err(err);
    data = data || {counter: 1}
    data.counter++;
    req.webtaskContext.storage.set(data, (err) => res.ok(data))
  })
});

module.exports = wt.fromExpress(app).auth0({
  exclude : ['/'],
  loginError: (error, ctx, req, res, baseUrl) => {
    res.writeHead(401, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(err('unauthorized', 401)));
  }
});
