import React from 'react';

const ControlPanel = ({ 
    tool, 
    setTool, 
    color, 
    setColor, 
    elements, 
    history,
    handleUndo, 
    handleRedo, 
    handleClearCanvas 
}) => {
    return (
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
                        <label htmlFor={toolType} className="form-check-label">
                            {toolType.charAt(0).toUpperCase() + toolType.slice(1)}
                        </label>
                    </div>
                ))}
            </div>
            <div className="col-md-3 mb-3 d-flex align-items-center gap-4">
                <label>Select Color: </label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ width: '60px', padding: '0', height: '30px' }}
                />
            </div>
            <div className="col-md-4 mb-3 d-flex gap-2">
                <button 
                    className="btn btn-primary" 
                    disabled={elements.length === 0} 
                    onClick={handleUndo}
                >
                    Undo
                </button>
                <button 
                    className="btn btn-outline-primary" 
                    disabled={history.length < 1} 
                    onClick={handleRedo}
                >
                    Redo
                </button>
                <button 
                    className="btn btn-danger" 
                    onClick={handleClearCanvas}
                >
                    Clear Canvas
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;