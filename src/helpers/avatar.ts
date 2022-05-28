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

export function generateAvatarPosition(room: string): number {
  const roomToPositionIdx = generateRoomToPositionIdx();
  const positions = roomToPositionIdx[room];

  return positions[Math.floor(Math.random() * positions.length)];
}
