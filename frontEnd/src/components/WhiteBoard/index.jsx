import React, { useEffect, useState } from 'react';
import rough from 'roughjs';

const roughGenerator = rough.generator();

function WhiteBoard({ canvasRef, ctxRef, elements, setElements, color, tool, user, socket }) {

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPoint, setLastPoint] = useState(null);
    const [img, setImg] = useState(null);
    const [receivedElements, setReceivedElements] = useState([]);

    useEffect(() => {
        console.log("I am here")
        socket.on("WhiteBoardDataResponse", (data) => {
            setImg(data.imgURL);
        })
    },[])
    
    useEffect(() => {
        console.log("I am here 1")
        socket.on("elementUpdateResponse", (data) => {
            setReceivedElements(data.elements);
        });
    }, [socket]);

    useEffect(() => {
        console.log("I am here 2")
        if (user?.presenter) {
            socket.emit("elementUpdate", { elements });
        }
    }, [elements, user]);
    
    if(!user?.presenter){
        return(
            <div className='border border-dark border-3 h-100 w-100 overflow-hidden'>
                <canvas 
                    ref={canvasRef} 
                    className="w-100 h-100"
                    style={{ minHeight: '500px' }}
                />
                {img && <img src={img} alt='Real-time whiteBoard will be sharing here' className='h-100 w-100'/>}
            </div>
        )
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;  
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;
    }, []);

    
    useEffect(() => {
        drawElements();
        const canvasImage = canvasRef.current.toDataURL()
        socket.emit("WhiteBoard", canvasImage);
    }, [elements]);

    function getCoordinates(e) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    
    function drawElements() {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const allElements = [...elements, ...receivedElements];

        allElements.forEach(element => {
            ctx.strokeStyle = element.stroke;
            
            switch (element.type) {
                case 'pencil':
                    ctx.beginPath();
                    ctx.moveTo(element.path[0][0], element.path[0][1]);
                    element.path.forEach(([x, y]) => {
                        ctx.lineTo(x, y);
                    });
                    ctx.stroke();
                    break;

                case 'line':
                    const roughLine = roughGenerator.line(
                        element.x1,
                        element.y1,
                        element.x2,
                        element.y2,
                        { 
                            stroke: element.stroke,
                            roughness: 0.8,  
                            bowing: 0.5      
                        }
                    );
                    rough.canvas(canvas).draw(roughLine);
                    break;

                case 'rectangle':
                    const roughRect = roughGenerator.rectangle(
                        element.x1,
                        element.y1,
                        element.width,
                        element.height,
                        { 
                            stroke: element.stroke,
                            roughness: 0.8,  
                            bowing: 0.5      
                        }
                    );
                    rough.canvas(canvas).draw(roughRect);
                    break;
                
                case 'square':
                    const side = Math.min(element.width, element.height);
                    const roughSqr = roughGenerator.rectangle(
                        element.x1,
                        element.y1,
                        side,
                        side,
                        {
                            stroke: element.stroke,
                            roughness: 0.8,
                            bowing: 0.5
                        }
                    );
                    rough.canvas(canvas).draw(roughSqr);
                    break;
            }
        });
    }

    
    function handleMouseDown(e) {
        const coords = getCoordinates(e);
        setIsDrawing(true);
        setLastPoint(coords);

        if (tool === 'pencil') {
            setElements(prev => [...prev, {
                type: 'pencil',
                path: [[coords.x, coords.y]],
                stroke: color
            }]);
        }
    }

    
    function handleMouseMove(e) {
        if (!isDrawing) return;
        const coords = getCoordinates(e);

        if (tool === 'pencil') {
            setElements(prev => {
                const lastElement = prev[prev.length - 1];
                return [
                    ...prev.slice(0, -1),
                    {
                        ...lastElement,
                        path: [...lastElement.path, [coords.x, coords.y]]
                    }
                ];
            });
        } else {
            
            drawElements();
            const ctx = canvasRef.current.getContext('2d');
            
            if (tool === 'line') {
                const roughLine = roughGenerator.line(
                    lastPoint.x,
                    lastPoint.y,
                    coords.x,
                    coords.y,
                    { 
                        stroke: color,
                        roughness: 0.8,
                        bowing: 0.5
                    }
                );
                rough.canvas(canvasRef.current).draw(roughLine);
            } else if (tool === 'rectangle') {
                const width = coords.x - lastPoint.x;
                const height = coords.y - lastPoint.y;
                const roughRect = roughGenerator.rectangle(
                    lastPoint.x,
                    lastPoint.y,
                    width,
                    height,
                    { 
                        stroke: color,
                        roughness: 0.8,
                        bowing: 0.5
                    }
                );
                rough.canvas(canvasRef.current).draw(roughRect);
            } else if (tool === 'square'){
                drawElements(); 
                const side = Math.min(
                    Math.abs(coords.x - lastPoint.x),
                    Math.abs(coords.y - lastPoint.y)
                ); 
                const roughSquare = roughGenerator.rectangle(
                    lastPoint.x,
                    lastPoint.y,
                    side,
                    side,
                    {
                        stroke: color,
                        roughness: 0.8,
                        bowing: 0.5
                    }
                );
                rough.canvas(canvasRef.current).draw(roughSquare);
            }
        }
    }

    
    function handleMouseUp(e) {
        if (!isDrawing) return;
        
        const coords = getCoordinates(e);

        if (tool === 'line') {
            setElements(prev => [...prev, {
                type: 'line',
                x1: lastPoint.x,
                y1: lastPoint.y,
                x2: coords.x,
                y2: coords.y,
                stroke: color
            }]);
        } else if (tool === 'rectangle') {
            const width = coords.x - lastPoint.x;
            const height = coords.y - lastPoint.y;
            setElements(prev => [...prev, {
                type: 'rectangle',
                x1: lastPoint.x,
                y1: lastPoint.y,
                width,
                height,
                stroke: color
            }]);
        } else if (tool === 'square') {
            const side = Math.min(
                Math.abs(coords.x - lastPoint.x),
                Math.abs(coords.y - lastPoint.y)
            );
            setElements(prev => [...prev, {
                type: 'square',
                x1: lastPoint.x,
                y1: lastPoint.y,
                width: side,
                height: side,
                stroke: color
            }]);
        }

        setIsDrawing(false);
        setLastPoint(null);
    }
    
    return (
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-dark w-100 h-100"
                style={{ 
                    minHeight: '500px',
                    cursor: 'crosshair'
                }}
            />
        </div>
    );
}

export default WhiteBoard;