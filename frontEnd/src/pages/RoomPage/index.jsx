import React, { useState, useRef } from 'react';
import WhiteBoard from '../../components/WhiteBoard';

function RoomPage({ user, socket }) {
    const ctxRef = useRef(null);
    const canvasRef = useRef(null);
    const [tool, setTool] = useState("pencil");
    const [color, setColor] = useState("#000000");
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]);

    function handleClearCanvas(){
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillRect = 'white';
        ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        setElements([]);
    }

    function handleUndo(){
        setHistory((prevHistory) => [...prevHistory, elements[elements.length-1]]);
        setElements((prevElement) => prevElement.slice(0,prevElement.length-1));
    }

    function handleRedo(){
        setElements((prevHistory) => [...prevHistory, history[history.length-1]]);
        setHistory((prevHistory) => prevHistory.slice(0,prevHistory.length-1));
    }

    return (
        <div className="container">
            <h1 className="text-center py-3">White Board Sharing App</h1>
            <div className="text-center mb-3">[Users Online : 0]</div>
            
            {user?.presenter && (
                <div className="row align-items-center justify-content-center">
                    <div className="col-md-3 mb-3 d-flex gap-2">
                        {['pencil', 'line', 'rectangle', 'square'].map((toolType) => (
                            <div className="form-check" key={toolType}>
                                <input
                                    type="radio"
                                    id={toolType}
                                    name="tool"
                                    value={toolType}
                                    className="form-check-input"
                                    checked={tool === toolType}
                                    onChange={(e) => setTool(e.target.value)}
                                />
                                <label htmlFor={toolType}>{toolType.charAt(0).toUpperCase() + toolType.slice(1)}</label>
                            </div>
                        ))}
                    </div>
                    <div className="col-md-3 mb-3 d-flex align-items-center gap-4">
                        <br/>
                        <br/>
                        <label>Select Color: </label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            style={{ width: '60px', padding: '0', height: '30px' }}
                        />
                    </div>
                    <div className="col-md-4 mb-3 d-flex gap-2">
                        <button className="btn btn-primary" disabled={elements.length === 0} onClick={() => handleUndo()}>Undo</button>
                        <button className="btn btn-outline-primary" disabled={history.length < 1} onClick={() => handleRedo()}>Redo</button>
                        <button className="btn btn-danger" onClick={handleClearCanvas}>Clear Canvas</button>
                    </div>
                </div>
            )}
            
            <WhiteBoard 
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                elements={elements}
                setElements={setElements}
                color={color}
                tool={tool}
                user={user}
                socket={socket}
            />
        </div>
    );
}

export default RoomPage;