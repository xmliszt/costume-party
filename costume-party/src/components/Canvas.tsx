import React, { useEffect, useRef } from "react";
import "./Canvas.css";

export default function Canvas(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) {
      context.strokeStyle = "#515151";
      context.lineWidth = 10;
      // Boundary wall
      context.strokeRect(0, 0, 600, 600);
      // Center room wall
      context.strokeRect(200, 200, 200, 200);
      // Draw north wall
      context.beginPath();
      context.moveTo(300, 0);
      context.lineTo(300, 200);
      context.stroke();
      context.closePath();
      // Draw west wall
      context.beginPath();
      context.moveTo(0, 300);
      context.lineTo(200, 300);
      context.stroke();
      context.closePath();
      // Draw south wall
      context.beginPath();
      context.moveTo(300, 600);
      context.lineTo(300, 400);
      context.stroke();
      context.closePath();
      // Draw east wall
      context.beginPath();
      context.moveTo(600, 300);
      context.lineTo(400, 300);
      context.stroke();
      context.closePath();

      // Color NW room
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(300, 0);
      context.lineTo(300, 200);
      context.lineTo(200, 200);
      context.lineTo(200, 300);
      context.lineTo(0, 300);
      context.fillStyle = "rgba(249, 169, 162, 0.5)";
      context.fill();
      context.closePath();

      // Color SW room
      context.beginPath();
      context.moveTo(0, 600);
      context.lineTo(300, 600);
      context.lineTo(300, 400);
      context.lineTo(200, 400);
      context.lineTo(200, 300);
      context.lineTo(0, 300);
      context.fillStyle = "rgba(169, 249, 162, 0.5)";
      context.fill();
      context.closePath();

      // Color SE room
      context.beginPath();
      context.moveTo(600, 600);
      context.lineTo(300, 600);
      context.lineTo(300, 400);
      context.lineTo(400, 400);
      context.lineTo(400, 300);
      context.lineTo(600, 300);
      context.fillStyle = "rgba(249, 245, 162, 0.5)";
      context.fill();
      context.closePath();

      // Color NE room
      context.beginPath();
      context.moveTo(600, 0);
      context.lineTo(300, 0);
      context.lineTo(300, 200);
      context.lineTo(400, 200);
      context.lineTo(400, 300);
      context.lineTo(600, 300);
      context.fillStyle = "rgba(116, 177, 247, 0.5)";
      context.fill();
      context.closePath();
    }
  }, []);

  return (
    <div className="game-board-holder">
      <canvas ref={canvasRef} width="600" height="600" />
    </div>
  );
}
