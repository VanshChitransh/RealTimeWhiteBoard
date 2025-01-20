import CreateRoomForm from './CreateRoomForm';
import './index.css'
import JoinRoomForm from './JoinRoomForm';
function Forms({uuid, socket, setUser}){
    return(
        <div className="row h-100 pt-5">
            <div className="col-md-4 mt-5 form-box p-5 border border-4 border-dark rounded-2 mx-auto d-flex flex-column align-items-center">
                <h1 className="text-primary fw-bold ">Create Room</h1>
                <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser}/>
            </div>
            <div className="col-md-4 mt-5 form-box p-5 border border-4 border-dark rounded-2 mx-auto d-flex flex-column align-items-center">
                <h1 className="text-primary fw-bold ">Join Room</h1>
                <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser}/>
            </div>
        </div>
    )
}

export default Forms;