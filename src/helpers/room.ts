import {Context} from "konva/lib/Context";
import {Shape, ShapeConfig} from "konva/lib/Shape";

export function areAdjacentRooms(room1: string, room2: string): boolean {
  const opposingCornerRooms = [
    ["TL", "BR"],
    ["TR", "BL"],
  ]

  for (const [r1, r2] of opposingCornerRooms) {
    if ((room1 === r1 && room2 === r2) || (room1 === r2 && room2 === r1)) return false
  }

  if (room1 === room2) return false;

  return true;
}

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

export function getRandomRoomID(): string {
  let text = "";
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 4; i++)
    text += charset
      .charAt(Math.floor(Math.random() * charset.length))
      .toUpperCase();
  return text;
}
