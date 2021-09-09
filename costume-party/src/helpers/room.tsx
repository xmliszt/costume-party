import { Context } from "konva/lib/Context";
import { ShapeConfig, Shape } from "konva/lib/Shape";

export function drawRoomTF(context: Context, shape: Shape<ShapeConfig>): void {
  context.beginPath();

  context.moveTo(0, 0);
  context.lineTo(300, 0);
  context.lineTo(300, 200);
  context.lineTo(200, 200);
  context.lineTo(200, 300);
  context.lineTo(0, 300);

  context.closePath();
  context.fillStrokeShape(shape);
}

export function drawRoomTR(context: Context, shape: Shape<ShapeConfig>): void {
  context.beginPath();

  context.moveTo(600, 0);
  context.lineTo(300, 0);
  context.lineTo(300, 200);
  context.lineTo(400, 200);
  context.lineTo(400, 300);
  context.lineTo(600, 300);

  context.closePath();
  context.fillStrokeShape(shape);
}

export function drawRoomBL(context: Context, shape: Shape<ShapeConfig>): void {
  context.beginPath();

  context.moveTo(0, 300);
  context.lineTo(0, 600);
  context.lineTo(300, 600);
  context.lineTo(300, 400);
  context.lineTo(200, 400);
  context.lineTo(200, 300);

  context.closePath();
  context.fillStrokeShape(shape);
}

export function drawRoomBR(context: Context, shape: Shape<ShapeConfig>): void {
  context.beginPath();

  context.moveTo(600, 600);
  context.lineTo(300, 600);
  context.lineTo(300, 400);
  context.lineTo(400, 400);
  context.lineTo(400, 300);
  context.lineTo(600, 300);

  context.closePath();
  context.fillStrokeShape(shape);
}
