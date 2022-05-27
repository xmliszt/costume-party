import { generateRoomToPositionIdx } from "./room";

export function generateAvatarColorLight(): string {
  const red = Math.floor(((1 + Math.random()) * 256) / 2);
  const green = Math.floor(((1 + Math.random()) * 256) / 2);
  const blue = Math.floor(((1 + Math.random()) * 256) / 2);
  return "rgb(" + red + ", " + green + ", " + blue + ")";
}

export function generateAvatarColorDark(): string {
  const red = Math.floor((Math.random() * 256) / 2);
  const green = Math.floor((Math.random() * 256) / 2);
  const blue = Math.floor((Math.random() * 256) / 2);
  return "rgb(" + red + ", " + green + ", " + blue + ")";
}

export function isInWhichRoom(positionIdx: number): string | null {
  const roomToPositionIdxs = generateRoomToPositionIdx();
  const TL = roomToPositionIdxs.TL;
  const TR = roomToPositionIdxs.TR;
  const C = roomToPositionIdxs.C;
  const BL = roomToPositionIdxs.BL;
  const BR = roomToPositionIdxs.BR;

  if (TL.includes(positionIdx)) return "TL";
  if (TR.includes(positionIdx)) return "TR";
  if (C.includes(positionIdx)) return "C";
  if (BL.includes(positionIdx)) return "BL";
  if (BR.includes(positionIdx)) return "BR";
  return null;
}

export function generateAvatarPosition(room: string): number {
  const roomToPositionIdx = generateRoomToPositionIdx();
  const positions = roomToPositionIdx[room];

  return positions[Math.floor(Math.random() * positions.length)];
}
