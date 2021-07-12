console.log('script loaded')

const socket = io('/')
const grid = document.getElementById('grid')
const peers = {}
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const streamToVideo = videoEl => stream => videoEl.srcObject = stream

const createVideoEl = (controls = false, muted = false) => {
    const vid = document.createElement('video')
    vid.controls = controls
    vid.muted = muted
    vid.addEventListener('loadedmetadata', () => vid.play())
    grid.append(vid)
    return [vid, streamToVideo(vid)]
}

const streamToMyVideo = createVideoEl(true, true)


const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream)
    const [vid, streamToLocalPeerVid] = createVideoEl()
    call.on('stream', stream => streamToLocalPeerVid(stream))
    call.on('close', () => vid.remove())
    peers[userId] = call
}


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    streamToMyVideo(stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const streamToPeerVid = createVideoEl()[1] 
        call.on('stream', stream => streamToPeerVid(stream))
    })

    socket.on('user-joined', userId => connectToNewUser(userId, stream))
    socket.on('user-left', userId => peers[userId] && peers[userId].close())
})

myPeer.on('open', id => {
    socket.emit('join-room', window.ROOM_ID, id)
})
