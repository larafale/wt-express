"use latest"

const app = new (require('express'))()


app.use((req, res, next) => {
  res.err = (err, statusCode = 500) => res.json({ statusCode, err: (err && err.message) || err || 'oups ! try again.' })
  res.ok = (item, statusCode = 200) => res.json({ statusCode, item })
  next()
})

app.get('/', (req, res) => res.ok({ app: 'running' }))

app.get('/stars', (req, res) => {
  req.webtaskContext.storage.get((err, data) => {
    if(err) return res.err(err)
    data = data || {counter: 1}
    data.counter++
    req.webtaskContext.storage.set(data, (err) => res.ok(data))
  })
})

export default require('webtask-tools').fromExpress(app).auth0({
  exclude : ['/'],
  loginError: (error, ctx, req, res, baseUrl) => {
    res.writeHead(401, { 'Content-Type': 'application/json'})
    res.end(JSON.stringify({ statusCode: 401, err: 'unauthorized' }))
  }
})
