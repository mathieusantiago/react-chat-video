const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");
const app = express();
const server = require("http").createServer(app);
const roomControler = require('./controller/room.controller')
const PORT = 3001;
let user = ''
let connectedUserRoom = {}

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static("public"));

io.on("connection", (socket) => {
  user = socket.id

  // send if user connected
  socket.emit('User connected', socket.id)

  // listen if user create room 
  socket.on("create_room", (...args) => {
    connectedUserRoom.id = user
    connectedUserRoom.room = args
    
    console.log(connectedUserRoom)
    // roomControler.createRoom(connectedUserRoom, "");
    io.emit('create_room', connectedUserRoom)
  });

  // socket.on('create_room', msg => {
  //   console.log(msg)
  //   io.emit('create_room', msg);
  // });
  
  // socket.on("join-room", (roomId, userId) => {
  //   console.log("User joined room:", roomId, userId);
  //   socket.join(roomId);
  //   socket.to(roomId).broadcast.emit("user-connected", userId);

  //   socket.on("disconnect", () => {
  //     console.log("User disconnected:", userId);
  //     socket.to(roomId).broadcast.emit("user-disconnected", userId);
  //   });
  // });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
