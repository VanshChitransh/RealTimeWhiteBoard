const express = require('express');
const app = express();
const cors = require('cors');
const server = require("http").createServer(app);
const { Server } = require("socket.io");

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});

app.get('/', (req, res) => {
    res.send("This is realtime board Sharing app");
});


io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("userJoined", (data) => {
        const {name, userId, roomId, host, presenter} = data;
        socket.join(roomId);
        socket.emit("userIsJoined", { success: true });
    });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Server is running on http://localhost:3000");
});