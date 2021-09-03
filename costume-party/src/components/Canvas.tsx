import { useEffect } from "react";
import { useRef } from "react";

export default function Canvas(props) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} {...props} />
    </div>
  );
}
