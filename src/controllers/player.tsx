export function validateNickname(nickname: string | null): boolean {
  if (nickname) {
    if (nickname?.length >= 3) return true;
  }
  return false;
}
