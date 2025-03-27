const express = require("express");
// // Here we imported the express module
const path = require("path");
const app = express();
// // Here we create the instance of the express application and this also create an HTTP server
const cors = require('cors');
// // Cross-origin resource sharing, as our backend is running on 3000 and frontEnd on 5173 so we are using CORS
const http = require("http");
const server = http.createServer(app);
// // Here we are creating an HTTP server as socket.Io need's an explicit http server (because express does not natively support WebSockets).
const { Server } = require("socket.io");
// // here we imported the Server Class from socket.io by syntax destructuring

app.use(cors());
// // It is a middleWare which is a security feature implemented by browsers that blocks website from making requests to a different origin/domain/port.
// // by doing app.use(cors()) we are telling express to use cors as a middleWare.

const io = new Server(server, {cors:{origin: "*", methods: ["GET","POST"]}});
// // Here we have create a socket.io server with CORS middleWare, the basic syntax is like this const io = new Server(server) but we had it like this const io = new Server(server,{})

const rooms = {};

function createUser(data) {
    const { roomId, userId, name, host, presenter } = data;
    
    // Check if the room already exists, if not than make a new one. 
    if (!rooms[roomId]) {
        rooms[roomId] = {
            users: [],
            whiteboard: {
                imgURL: null,
                elements: []
            }
        };
    }

    // Remove any existing users with the same socket ID
    rooms[roomId].users = rooms[roomId].users.filter(user => user.userId !== userId);

    // Add new user
    // Here we are creating a new user with userId, name, host and if the user is presenter or not.
    const newUser = { 
        userId, 
        name, 
        host: host || false, 
        presenter: presenter || false 
    };
    rooms[roomId].users.push(newUser);

    return rooms[roomId].users;
}

io.on("connection", (socket) => {
    console.log("New socket connection:", socket.id);

    socket.on("userJoined", (data) => {
        console.log("User Joined Data:", data);
        const { roomId } = data;

    
        const users = createUser({
            ...data,
            userId: socket.id
        });

        
        socket.join(roomId);
        socket.emit("userIsJoined", { 
            success: true, 
            users 
        });

       
        socket.broadcast.to(roomId).emit("userListUpdate", users);

    
        if (rooms[roomId]?.whiteboard?.imgURL) {
            socket.emit("whiteBoardDataResponse", {
                imgURL: rooms[roomId].whiteboard.imgURL,
                elements: rooms[roomId].whiteboard.elements || []
            });
        }
    });

    socket.on("whiteBoardData", (data) => {
        const { roomId, imgURL } = data;
        console.log("Whiteboard Data Received:", { roomId, imgURL });

        if (rooms[roomId]) {
            rooms[roomId].whiteboard.imgURL = imgURL;
            socket.broadcast.to(roomId).emit("whiteBoardDataResponse", { 
                imgURL 
            });
        }
    });

    socket.on("elementUpdate", (data) => {
        const { roomId, elements } = data;
        console.log("Element Update Received:", { roomId, elements });

        if (rooms[roomId]) {
            rooms[roomId].whiteboard.elements = elements;
            socket.broadcast.to(roomId).emit("whiteBoardDataResponse", { 
                elements 
            });
        }
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        
        for (let roomId in rooms) {
            rooms[roomId].users = rooms[roomId].users.filter(
                user => user.userId !== socket.id
            );
            io.to(roomId).emit("userListUpdate", rooms[roomId].users);
        }
    });
});

// Add this after your existing routes
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontEnd/dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../frontEnd/dist/index.html'));
    });
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});