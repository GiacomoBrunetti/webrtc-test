const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const {v4: uuidV4} = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:roomId', (req, res) => {
    res.render('room', { roomId: req.params.roomId })
})


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-joined', userId)
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-left', userId)
        })
    })
})

server.listen(3000)