import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "@firebase/firestore";
import { IAvatarProps } from "../interfaces/avatar";

export async function updateAvatarStatus(
  roomID: string,
  avatarID: string,
  dead: boolean
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(doc(db, "rooms", roomID, "avatars", avatarID), {
      dead,
    })
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function updateAvatarProps(
  roomID: string,
  avatarID: string,
  positionIdx: number,
  strokeColor: string
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(doc(db, "rooms", roomID, "avatars", avatarID), {
      positionIdx,
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

export async function getAllAvatars(): Promise<IAvatarProps[]> {
  return new Promise((res, rej) => {
    getDocs(
      collection(db, "rooms", localStorage.getItem("room_id")!, "avatars")
    )
      .then((snapshots) => {
        const _avatars: IAvatarProps[] = [];

        snapshots.forEach((_doc) => {
          const data = _doc.data();
          _avatars.push({
            id: data.id,
            positionIdx: data.positionIdx,
            strokeColor: data.strokeColor,
            imageUrl: `${process.env.PUBLIC_URL}/avatars/${data.id}.png`,
            dead: data.dead,
          });
        });

        res(_avatars);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function getAvatarByID(avatarID: string): Promise<IAvatarProps> {
  return new Promise((res, rej) => {
    const q = query(
      collection(db, "rooms", localStorage.getItem("room_id")!, "avatars"),
      where("id", "==", avatarID)
    );
    getDocs(q)
      .then((snapshots) => {
        if (snapshots.size > 1) rej("duplicate avatar!");
        const data = snapshots.docs[0].data();
        res({
          id: data.id,
          positionIdx: data.positionIdx,
          strokeColor: data.strokeColor,
          imageUrl: `${process.env.PUBLIC_URL}/avatars/${data.id}.png`,
          dead: data.dead,
        });
      })
      .catch((err) => {
        rej(err);
      });
  });
}
