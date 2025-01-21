const express = require('express');
// Here we imported the express module
const app = express();
// Here we create the instance of the express application and this also create an HTTP server
const cors = require('cors');
// Cross-origin resource sharing, as our backend is running on 3000 and frontEnd on 5173 so we are using CORS
const server = require("http").createServer(app);
// Here we are creating an HTTP server as socket.Io need's an explicit http server (because express does not natively support WebSockets).
const { Server } = require("socket.io");
// here we imported the Server Class from socket.io by syntax destructuring

app.use(cors());
// It is a middleWare which is a security feature implemented by browsers that blocks website from making requests to a different origin/domain/port.
// by doing app.use(cors()) we are telling express to use cors as a middleWare.

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"]
    }
});
// Here we have create a socket.io server with CORS middleWare, the basic syntax is like this const io = new Server(server) but we had it like this const io = new Server(server,{})

app.get('/', (req, res) => {
    res.send("This is realtime board Sharing app");
});
// This is just to check wheater the server is connected or not.

io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("userJoined", (data) => {
        const {name, userId, roomId, host, presenter} = data;
        socket.join(roomId);
        socket.emit("userIsJoined", { success: true });
    });
});
// In this code we connect to the socket.io server by using connection and then we have our custom even
// userJoined on this custom event we destructure the data and make the server(socket) join to room id and emit our final message.

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});