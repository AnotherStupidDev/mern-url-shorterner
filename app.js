const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const helmet = require('helmet')
const morgan = require('morgan')

const acessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express()

app.use(express.json({ extended: true }))
app.use(morgan('common', { stream: acessLogStream }))
app.use(helmet())


app.use('/api/auth', require('./routes/auth.routes.js'))
app.use('/api/link', require('./routes/link.routes.js'))
app.use('/t', require('./routes/redirect.routes.js'))

if (process.env.NODE_ENV === "production") {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = config.get('port') || 5000
const mongoURI = config.get('mongoURI')

async function start() {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: true
        })
        app.listen(PORT, () => console.log(`App has been started on ${PORT}...`))
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}

start()

