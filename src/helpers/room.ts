import { GRID, roomColorMapping } from "../constants";
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

export function generateRoomToPositionIdx(): Record<string, number[]> {
  const result: Record<string, number[]> = {
    TL: [],
    TR: [],
    C: [],
    BL: [],
    BR: [],
  };
  let index = 0;
  for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
    for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
      const slotProps = makeSlotProps(index, row, col);
      result[slotProps.roomType].push(index);
      index++;
    }
  }
  return result;
}

export function generateRandomSlotPositions(
  forHowMany: number,
  startNumber: number,
  endNumber: number
): Array<number> {
  const numbers = [];
  for (let i = startNumber; i <= endNumber; i++) {
    numbers.push(i);
  }
  const results = [];
  for (let i = 0; i < forHowMany; i++) {
    const idx = Math.floor(Math.random() * numbers.length);
    results.push(numbers[idx]);
    delete numbers[idx];
  }
  return results;
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

export function getAvailableMovingRooms(currentRoomType: string): string[] {
  switch (currentRoomType) {
    case "TL":
      return ["TR", "C", "BL"];
    case "TR":
      return ["TL", "C", "BR"];
    case "C":
      return ["TL", "TR", "BL", "BR"];
    case "BL":
      return ["TL", "C", "BR"];
    case "BR":
      return ["TR", "C", "BL"];
    default:
      return [];
  }
}

export function getUnAvailableMovingRooms(currentRoomType: string): string[] {
  switch (currentRoomType) {
    case "TL":
      return ["TL", "BR"];
    case "TR":
      return ["TR", "BL"];
    case "C":
      return ["C"];
    case "BL":
      return ["TR", "BL"];
    case "BR":
      return ["TL", "BR"];
    default:
      return [];
  }
}

export function highlightSlot(slotIndex: number): void {
  const slot = document.getElementById(`slot-${slotIndex}`);
  if (slot != null) {
    slot!.className = slot!.className.replace("slot", "slot-focus");
  }
}

export function unHighlightSlot(slotIndex: number): void {
  const slot = document.getElementById(`slot-${slotIndex}`);
  if (slot != null) {
    slot!.className = slot!.className.replace("slot-focus", "slot");
  }
}
