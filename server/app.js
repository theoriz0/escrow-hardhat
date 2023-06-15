const express = require('express')
const app = express()
var cors = require('cors')
const port = 3000

const escrows = new Map()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json(Array.from(escrows.values()))
})

app.post('/approve', (req, res) => {
  escrows.get(req.body.address).isApproved = true
  res.sendStatus(200)
})

app.post('/new', (req, res) => {
    const escrow = req.body
    escrow.isApproved = false
    escrows.set(escrow.address, escrow)
    res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})