import Forms from "./components/Forms/index"
import { Route, Routes } from "react-router-dom"
import './App.css'
import RoomPage from "./pages/RoomPage"
import io from "socket.io-client"
import { useEffect, useState } from "react"

const server = "http://localhost:3000";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity",
  timeout: 10000,
  transports: ["websocket"]
}

const socket = io(server, connectionOptions);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Changed Socket.on to socket.on (lowercase)
    socket.on("userIsJoined", (data) => {
      if (data.success) {
        console.log("UserJoined");
      } else {
        console.log("userJoined error");
      }
    });

    // Add cleanup function to remove event listener
    return () => {
      socket.off("userIsJoined");
    };
  }, []);
  
  const uuid = () => {
    let s4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }

  return (
    <div className="container">
      <Routes>
        <Route 
          path="/" 
          element={<Forms uuid={uuid} socket={socket} setUser={setUser}/>}
        />
        <Route 
          path="/:roomId" 
          element={<RoomPage user={user} socket={socket}/>}
        />
      </Routes>
    </div>
  )
}

export default App