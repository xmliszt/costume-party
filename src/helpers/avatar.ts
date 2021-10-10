import {IAvatarPosition} from "../interfaces/avatar";
import {getRandomInt} from "./number";

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

export function generateAvatarPosition(room: string): IAvatarPosition {
  let x = 0;
  let y = 0;
  switch (room) {
  case "TL":
    x = getRandomInt(0, 260);
    y = getRandomInt(0, 160);
    break;
  case "BL":
    x = getRandomInt(0, 260);
    y = getRandomInt(400, 560);
    break;
  case "TR":
    x = getRandomInt(300, 560);
    y = getRandomInt(0, 160);
    break;
  case "BR":
    x = getRandomInt(400, 560);
    y = getRandomInt(300, 560);
    break;
  case "C":
    x = getRandomInt(200, 360);
    y = getRandomInt(200, 360);
  }
  return {
    x,
    y,
  };
}

export function isInWhichRoom(position: IAvatarPosition): string {
  // Top Layer
  if (position.y < 200) {
    if (position.x <= 300) return "TL";
    if (position.x > 300) return "TR";
  }

  // Middle Upper Layer
  if (200 <= position.y && position.y < 300) {
    if (position.x < 200) return "TL";
    if (200 <= position.x && position.x <= 400) return "C";
    if (position.x > 400) return "TR";
  }

  // Middle Lower Layer
  if (300 <= position.y && position.y <= 400) {
    if (position.x < 200) return "BL";
    if (200 <= position.x && position.x <= 400) return "C";
    if (position.x > 400) return "BR";
  }

  // Bottom Layer
  if (position.y > 400) {
    if (position.x <= 300) return "BL";
    if (position.x > 300) return "BR";
  }

  return "TL";
}

export function clipAvatarPosition(
  roomType: string,
  currentPosition: IAvatarPosition
): IAvatarPosition {
  if (currentPosition.x <= 0) {
    currentPosition.x = 0;
  } else if (currentPosition.x >= 560) {
    currentPosition.x = 560;
  }
  if (currentPosition.y <= 0) {
    currentPosition.y = 0;
  } else if (currentPosition.y >= 560) {
    currentPosition.y = 560;
  }

  /* I think this logic can be greatly simplified to just clip the outer perimeter
      *  The inner perimeter needs no clipping because if you cross over the boundary, it should have been
      *  identified as the other roomType.
      *
      *  Actually I think a better simplification is to disallow users from releasing the avatar on an unidentified roomType
      *  then we don't need to clip the avatar position anymore
      *
      * Alternatively... use clipAvatarPosition to limit the avatar's position within the big box. Then call
      * clipAvatarPosition first before calling isInWhichRoom.
      * */
  switch (roomType) {
  case "TL":
    if (currentPosition.x > 260) currentPosition.x = 260;
    if (currentPosition.y > 160 && currentPosition.x > 200)
      currentPosition.y = 160;
    if (currentPosition.y > 200 && currentPosition.x > 160)
      currentPosition.x = 160;
    if (currentPosition.y > 260) currentPosition.y = 260;
    break;
  case "TR":
    if (currentPosition.x < 300) currentPosition.x = 300;
    if (currentPosition.y > 160 && currentPosition.x < 400)
      currentPosition.y = 160;
    if (currentPosition.y > 200 && currentPosition.x < 400)
      currentPosition.x = 400;
    if (currentPosition.y > 260) currentPosition.y = 260;
    break;
  case "BL":
    if (currentPosition.x > 260) currentPosition.x = 260;
    if (currentPosition.y < 400 && currentPosition.x > 200)
      currentPosition.y = 400;
    if (currentPosition.y < 400 && currentPosition.x > 160)
      currentPosition.x = 160;
    if (currentPosition.y < 300) currentPosition.y = 300;
    break;
  case "BR":
    if (currentPosition.x < 300) currentPosition.x = 300;
    if (currentPosition.y < 400 && currentPosition.x < 400)
      currentPosition.y = 400;
    if (currentPosition.y < 400 && currentPosition.x < 400)
      currentPosition.x = 400;
    if (currentPosition.y < 300) currentPosition.y = 300;
    break;
  case "C":
    if (currentPosition.x > 360) currentPosition.x = 360;
    if (currentPosition.y > 360) currentPosition.y = 360;
    break;
  }

  return currentPosition;
}
