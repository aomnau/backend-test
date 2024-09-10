const express = require('express')
const cors = require('cors')
const app = express()
const authRouter = require('./routes/auth-routh')

app.use(cors())
app.use(express.json())

app.use('/auth', authRouter)

const port = 3000
app.listen(port, ()=>
    console.log('Server on port :', port))