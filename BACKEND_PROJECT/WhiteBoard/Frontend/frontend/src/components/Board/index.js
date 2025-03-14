import { useContext, useEffect, useRef, useCallback } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import { useWebSocket } from "../../hooks/useWebSocket";
import classes from "./index.module.css";
import { updateCanvas } from "../../utils/api";
import { getSvgPathFromStroke } from "../../utils/element";
import getStroke from "perfect-freehand";

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const {
    elements,
    setElements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undo,
    redo,
  } = useContext(boardContext);
  const { toolboxState } = useContext(toolboxContext);

  const canvasId = window.location.pathname.split('/').pop();
  
  // Process incoming canvas updates
  const handleCanvasUpdate = useCallback((updatedElements) => {
    const processedElements = updatedElements.map(element => {
      if (element.type === TOOL_ITEMS.BRUSH) {
        const pathData = getSvgPathFromStroke(getStroke(element.points));
        return {
          ...element,
          path: new Path2D(pathData)
        };
      }
      return element;
    });
    setElements(processedElements);
  }, [setElements]);

  // Initialize WebSocket connection
  const { emitCanvasUpdate } = useWebSocket(canvasId, handleCanvasUpdate);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save();

    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH:
          context.fillStyle = element.stroke;
          const brushPath = element.path || new Path2D(getSvgPathFromStroke(getStroke(element.points)));
          context.fill(brushPath);
          context.restore();
          break;
        case TOOL_ITEMS.TEXT:
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        default:
          throw new Error("Type not recognized");
      }
    });

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  const handleMouseDown = (event) => {
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    boardMouseMoveHandler(event);
  };

  const handleMouseUp = useCallback(() => {
    boardMouseUpHandler();
    
    const serializableElements = elements.map(element => {
      if (element.type === TOOL_ITEMS.BRUSH) {
        const { path, ...rest } = element;
        return rest;
      }
      return element;
    });
    
    updateCanvas(canvasId, serializableElements);
    emitCanvasUpdate(serializableElements);
  }, [boardMouseUpHandler, canvasId, elements, emitCanvasUpdate]);

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;