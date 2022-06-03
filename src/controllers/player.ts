export function validateNickname(nickname: string | null): boolean {
  if (nickname) {
    if (nickname.trim()?.length >= 3) return true;
  }
  return false;
}

export function isMyTurn(
  myOrder: number,
  turn: number,
  capacity: number
): boolean {
  if (myOrder === capacity) {
    return turn % capacity === 0;
  } else {
    return turn % capacity === myOrder;
  }
}
