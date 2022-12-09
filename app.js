const express = require('express')
const Test = require('./modules/test.controller')

Test.solution();

const app = express()

app.get('/test', (req, res, next) => {
  res.json({ data: Test.solution() })
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})

