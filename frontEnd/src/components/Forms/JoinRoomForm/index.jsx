import { useState } from "react"
import './index.css'

function JoinRoomForm(){
    const[name, setName] = useState("");
    const[error, setError] = useState("");
    const[codeError, setCodeError] = useState("");
    const[code, setCode] = useState("");

    function handelFormClick(e){
        e.preventDefault();
        // console.log("Hello");
        // console.log("This is codeError -> ",codeError);
        // console.log("Hi there");
        setError("");
        setCodeError("");
        let hasError = false;
        // (Solution for escaping return in both of the below if statements)

        if(!name.trim()){
            setError("Please enter your name ");
            // console.log("This is codeError -> ",codeError);
            // console.log("This is code -> ", code);
            hasError = true;
            // return;
        }
        if(!code.trim()){
            setCodeError("Please enter your code ");
            // console.log("This is codeError -> ",codeError);
            hasError = true;
            // return;
        }
        if(hasError) return;
        // console.log("This is codeError -> ",codeError);
        setError("");
        setCode("");
    }
    return(
        <form className="form col-md-12 mt-5">
            <div className="form-group">
                <input type="text" className="form-control my-2" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>
            {/* {console.log(error)} */}
            {error && <div className="error-message">{error}</div>}
            <div className="form-group border">
                    <input type="text" className="form-control my-2 border-0" placeholder="Enter your code" value={code} onChange={(e) => setCode(e.target.value)}/>
            </div>
            {/* {console.log(codeError)} */}
            {codeError && <div className="error-message">{codeError}</div>}
            <button type="submit" className="mt-4 btn btn-primary btn-block form-control" onClick={handelFormClick}>Join Room</button>
        </form>
    )
}
export default JoinRoomForm
