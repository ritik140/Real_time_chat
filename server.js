const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set Static folder

app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

//Run when client connects
io.on("connection", (socket) => {
  // console.log("New WS Connection...");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome to the new user
    socket.emit("message", formatMessage(botName, "welcome to chatcord!"));

    //BroadCast when a user connets
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} has join the chat`));
  });

  //Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    io.emit("message", formatMessage("USER", msg));
  });

  //Runs when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", formatMessage(botName, "A User has left the chat"));
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
