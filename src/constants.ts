import {tNumberToString, tRoomTypes, tStringToString} from "./types";

export const colors = {
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
  NULL: 5,
};

export const actionToRoomType: tRoomTypes = {
  0: "BL",
  1: "TL",
  2: "TR",
  3: "BR",
}

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
