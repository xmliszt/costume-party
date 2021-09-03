import React, { useEffect } from "react";
import { useRef } from "react";
import "Canvas.css";

export default function Canvas(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, 100, 300);
      }
    }
  }, []);

  return (
    <div className="game-board-holder">
      <canvas ref={canvasRef} width="600" height="600" />
    </div>
  );
}
