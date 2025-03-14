import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./Pages/Login";
import CanvasList from "./Pages/canvasList";
import CanvasBoard from "./Pages/canvasBoard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/canvasList" element={<CanvasList />} />
        <Route path="/canvas/:canvasId" element={<CanvasBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
