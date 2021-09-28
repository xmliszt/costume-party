import { getRandomInt } from "./number";

export function getRandomAction(): number {
  return getRandomInt(0, 5);
}
