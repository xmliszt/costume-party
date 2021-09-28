import { getRandomInt } from "./number";

export function getRandomAction(): number {
  let choice = getRandomInt(0, 5);
  if (choice == 5) choice = 4; // give BLACK 1 more chance
  return choice;
}
