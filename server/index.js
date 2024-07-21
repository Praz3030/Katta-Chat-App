const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const cors = require("cors");

app.use(
  cors({
    origin: "*",
  })
);
dotenv.config();
app.use(express.json());

const connect_db = async () => {
  try {
    const connect = await mongoose.connect(process.env.DATABASE);
    console.log("connected to mongo db");
  } catch (error) {
    console.log("error connecting to database", error.message);
  }
};
connect_db();
app.get("/", (req, res) => {
  res.send("Welcome to Katta");
});
app.use("/user", userRoutes);
app.use("/chats", chatRoutes);
app.use("/message", messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("Server is running");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});
const onlineUsers = {};
io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    onlineUsers[userId] = socket.id;
    socket.join(userId);
    socket.emit("connected");

    io.emit("user online", userId);
  });

  socket.on("disconnect", () => {
    const userId = Object.keys(onlineUsers).find(
      (key) => onlineUsers[key] === socket.id
    );
    if (userId) {
      delete onlineUsers[userId];

      io.emit("user offline", userId);
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing", room));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

  socket.on("new message", (newMessageStatus) => {
    var chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not found");
    }
    chat.users.forEach((user) => {
      if (user._id == newMessageStatus.sender._id) return;
      socket.in(user._id).emit("message received", newMessageStatus);
    });
  });
});
