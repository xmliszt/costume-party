import React from "react";
import { Layer, Rect, Stage } from "react-konva";
import "./Room.css";

export default function Room(): React.ReactElement {
  return (
    <Stage width={600} height={600} className="playground">
      <Layer>
        <Rect
          x={0}
          y={0}
          width={200}
          height={200}
          fill="yellow"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={5}
          shadowBlur={5}
        ></Rect>
        <Rect
          x={400}
          y={0}
          width={200}
          height={200}
          fill="blue"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={5}
          shadowBlur={5}
        ></Rect>
        <Rect
          x={0}
          y={400}
          width={200}
          height={200}
          fill="green"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={5}
          shadowBlur={5}
        ></Rect>
        <Rect
          x={400}
          y={400}
          width={200}
          height={200}
          fill="red"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={5}
          shadowBlur={5}
        ></Rect>
        <Rect
          x={200}
          y={200}
          width={200}
          height={200}
          fill="grey"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={5}
          shadowBlur={5}
        ></Rect>
      </Layer>
    </Stage>
  );
}
