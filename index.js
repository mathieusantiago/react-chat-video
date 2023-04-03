const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;

// Utilisez le middleware CORS pour autoriser les requêtes provenant de l'origine spécifiée
app.use(cors());

app.use(express.static("public"));
const users = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  users[socket.id] = true;

  socket.broadcast.emit("allUsers", { users });

  socket.on("callUser", ({ userToCall, signalData, from }) => {
    console.log("callUser:", userToCall, signalData, from);
    io.to(userToCall).emit("callUser", { signal: signalData, from });
  });

  socket.on("answerCall", ({ signal, to }) => {
    console.log("callAccepted:", signal, to);
    io.to(to).emit("callAccepted", signal);
  });

  // Ajoutez un gestionnaire d'événements d'erreur pour le socket
  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });

  // Ajoutez des `console.log` pour vérifier les IDs et les connexions
  socket.on("join-room", (roomId, userId) => {
    console.log("User joined room:", roomId, userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
