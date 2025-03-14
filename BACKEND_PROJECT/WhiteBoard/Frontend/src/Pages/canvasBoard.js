import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import Toolbar from "../components/Toolbar";
import Toolbox from "../components/Toolbox";
import BoardProvider from "../store/BoardProvider";
import ToolboxProvider from "../store/ToolboxProvider";

function CanvasBoard() {
  const { canvasId } = useParams();
  const [canvasData, setCanvasData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCanvas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `https://whiteboard-ftu8.onrender.com/canvas/load/${canvasId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch canvas");
        }

        setCanvasData(data);
      } catch (err) {
        setError(err.message);
        navigate("/");
      }
    };

    fetchCanvas();
  }, [canvasId, navigate]);

  if (error) return <p>Error: {error}</p>;
  if (!canvasData) return <p>Loading...</p>;

  return (
    <BoardProvider initialCanvas={canvasData}>
    <ToolboxProvider>
      <Toolbar />
      <Board />
      <Toolbox />
    </ToolboxProvider>
  </BoardProvider>
  );
}

export default CanvasBoard;
