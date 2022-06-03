import { tNumberToString, tRoomTypes, tStringToString } from "./types";

export const GRID = {
  GRID_ROW_LENGTH: 12,
  GRID_CLN_LENGTH: 12,
};

export const COLORS: { [key: string]: string } = {
  green: "#67C23A",
  yellow: "#E6A23C",
  blue: "#409EFF",
  red: "#F56C6C",
  black: "#606266",
};

export const colorStringToColorMapping: tStringToString = {
  "#67C23A": "green",
  "#E6A23C": "yellow",
  "#409EFF": "blue",
  "#F56C6C": "red",
  "#606266": "black",
};

export const colorRoomMapping: { [key: string]: string } = {
  "#E6A23C": "TL",
  "#409EFF": "TR",
  "#67C23A": "BL",
  "#F56C6C": "BR",
  "#606266": "C",
};

export const roomColorMapping: tRoomTypes = {
  TL: COLORS.yellow,
  TR: COLORS.blue,
  BL: COLORS.green,
  BR: COLORS.red,
  C: COLORS.black,
};

export const roomColorNameMapping: { [key: string]: string } = {
  TL: "Yellow",
  TR: "Blue",
  BL: "Green",
  BR: "Red",
  C: "Black",
};

export const actions: { [key: string]: number } = {
  green: 0,
  yellow: 1,
  blue: 2,
  red: 3,
  black: 4,
  null: 5,
};

export const actionToMessageMapping: tNumberToString = {
  0: "Move anyone out of green room to any adjacent room, or move anyone into the green room from any adjacent room.",
  1: "Move anyone out of yellow room to any adjacent room, or move anyone into the yellow room from any adjacent room.",
  2: "Move anyone out of blue room to any adjacent room, or move anyone into the blue room from any adjacent room.",
  3: "Move anyone out of red room to any adjacent room, or move anyone into the red room from any adjacent room.",
  4: "Click someone in your room to murder!",
};

export const actionToColorStringMapping: tNumberToString = {
  0: "green",
  1: "yellow",
  2: "blue",
  3: "red",
  4: "black",
};

export const actionToColorMapping: tNumberToString = {
  0: "#67C23A",
  1: "#E6A23C",
  2: "#409EFF",
  3: "#F56C6C",
  4: "#606266",
};

export const statusPrecedentMap: { [key: string]: number } = {
  waiting: -1,
  choosing: 0,
  picking: 1,
  moving: 2,
  killing: 1,
  dead: 999,
  kill: 999,
  skip: 999,
};
