import { tRoomTypes } from "./types/room";

export const colors = {
  green: "#67C23A",
  yellow: "#E6A23C",
  blue: "#409EFF",
  red: "#F56C6C",
  black: "#606266",
};

export const roomColorMapping: tRoomTypes = {
  TL: colors.yellow,
  TR: colors.blue,
  BL: colors.green,
  BR: colors.red,
  C: colors.black,
};

export const actions = {
  GREEN: 0,
  YELLOW: 1,
  BLUE: 2,
  RED: 3,
  BLACK: 4,
};
