import { roomColorMapping } from "../constants";
import { ISlot } from "../interfaces/room";

export function makeSlotProps(index: number, row: number, col: number): ISlot {
  if ((row < 3 && col < 6) || (row < 6 && col < 3)) {
    return {
      index,
      roomType: "TL",
      color: roomColorMapping["TL"],
      occupied: false,
    };
  }
  if ((row < 3 && col >= 6) || (row < 6 && col >= 9)) {
    return {
      index,
      roomType: "TR",
      color: roomColorMapping["TR"],
      occupied: false,
    };
  }
  if (row >= 3 && row < 9 && col >= 3 && col < 9) {
    return {
      index,
      roomType: "C",
      color: roomColorMapping["C"],
      occupied: false,
    };
  }
  if ((row >= 6 && col < 3) || (row >= 9 && col < 6)) {
    return {
      index,
      roomType: "BL",
      color: roomColorMapping["BL"],
      occupied: false,
    };
  }
  return {
    index,
    roomType: "BR",
    color: roomColorMapping["BR"],
    occupied: false,
  };
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
