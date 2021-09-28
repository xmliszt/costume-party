import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "../firebase";
import { IAvatarProps } from "../interfaces/avatar";
import { getAvatarByID } from "./avatar";

export async function getAvatarForPlayer(
  nickname: string
): Promise<IAvatarProps> {
  return new Promise((res, rej) => {
    const q = query(
      collection(db, "rooms", localStorage.getItem("room_id")!, "players"),
      where("nickname", "==", nickname)
    );
    getDocs(q)
      .then(async (snapshots) => {
        if (snapshots.size < 1) rej("no player found!");
        if (snapshots.size > 1) rej("duplicate players!");
        const data = snapshots.docs[0].data();
        const avatarID = data.avatar.toString();
        const avatarProps = await getAvatarByID(avatarID);
        res(avatarProps);
      })
      .catch((err) => {
        rej(err);
      });
  });
}
