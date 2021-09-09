import React from "react";
import { Layer, Rect, Shape } from "react-konva";
import { colors } from "../constants";
import {
  drawRoomBL,
  drawRoomBR,
  drawRoomTF,
  drawRoomTR,
} from "../helpers/room";

export default function Room(): React.ReactElement {
  return (
    <Layer>
      <Shape
        id="yellow"
        sceneFunc={drawRoomTF}
        fill={colors.yellow}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={10}
        shadowBlur={5}
      ></Shape>
      <Shape
        id="blue"
        sceneFunc={drawRoomTR}
        fill={colors.blue}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={10}
        shadowBlur={5}
      ></Shape>
      <Shape
        id="green"
        sceneFunc={drawRoomBL}
        fill={colors.green}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={10}
        shadowBlur={5}
      ></Shape>
      <Shape
        id="red"
        sceneFunc={drawRoomBR}
        fill={colors.red}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={5}
        shadowBlur={5}
      ></Shape>
      <Rect
        id="black"
        x={200}
        y={200}
        width={200}
        height={200}
        fill={colors.black}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={10}
        shadowBlur={5}
      ></Rect>
    </Layer>
  );
}
