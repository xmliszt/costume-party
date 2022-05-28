import { IAvatarProps } from "../interfaces/avatar";
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

export function getAllAvatarPositions(avatars: IAvatarProps[]): number[] {
  const results = [];
  for (const avatar of avatars) {
    if (!avatar.dead) {
      results.push(avatar.positionIdx);
    }
  }
  return results;
}

export function getAvatarPositionMap(avatars: IAvatarProps[]): {
  [key: number]: IAvatarProps;
} {
  const results: { [key: number]: IAvatarProps } = {};
  for (const avatar of avatars) {
    results[avatar.positionIdx] = avatar;
  }
  return results;
}
