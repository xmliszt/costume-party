import { db } from "../firebase";
import { doc, updateDoc } from "@firebase/firestore";

export async function updateAvatarProps(
  roomID: string,
  avatarID: string,
  x: number,
  y: number,
  strokeColor: string
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(doc(db, "rooms", roomID, "avatars", avatarID), {
      x,
      y,
      strokeColor,
    })
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}
