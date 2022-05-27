export function drawRoomTF(): void {
  console.log("Draw room TF");
}

export function drawRoomTR(): void {
  console.log("Draw room TR");
}

export function drawRoomBL(): void {
  console.log("Draw room BL");
}

export function drawRoomBR(): void {
  console.log("Draw room BR");
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
