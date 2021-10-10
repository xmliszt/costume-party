import {collection, doc, getDoc, getDocs, query, updateDoc, where,} from "@firebase/firestore";
import {db} from "../firebase";
import {IAvatarProps} from "../interfaces/avatar";
import IPlayerProps from "../interfaces/player";
import {getAvatarByID} from "./avatar";
import {actions} from "../constants";

export async function getAllPlayers(): Promise<Array<IPlayerProps>> {
  return new Promise((res, rej) => {
    getDocs(
      collection(db, "rooms", localStorage.getItem("room_id")!, "players")
    )
      .then((snapshots) => {
        const players: Array<IPlayerProps> = [];
        snapshots.forEach((doc) => {
          const data = doc.data();
          players.push({
            nickname: data.nickname,
            alive: data.alive,
            order: data.order,
            avatar: data.avatar,
            action: data.action,
            message: data.message,
            status: data.status,
          });
        });
        res(players);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function getPlayerByNickname(
  nickname: string
): Promise<IPlayerProps> {
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
        res({
          nickname: data.nickname,
          alive: data.alive,
          order: data.order,
          avatar: data.avatar,
          action: data.action,
          message: data.message,
          status: data.status,
        });
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function getPlayerByAvatarID(
  avatarID: number
): Promise<IPlayerProps> {
  return new Promise((res, rej) => {
    const q = query(
      collection(db, "rooms", localStorage.getItem("room_id")!, "players"),
      where("avatar", "==", avatarID)
    );
    getDocs(q)
      .then((snapshots) => {
        if (snapshots.size < 1) rej("no player found!");
        if (snapshots.size > 1) rej("duplicate players!");
        const data = snapshots.docs[0].data();
        res({
          nickname: data.nickname,
          alive: data.alive,
          order: data.order,
          avatar: data.avatar,
          action: data.action,
          message: data.message,
          status: data.status,
        });
      })
      .catch((err) => {
        rej(err);
      });
  });
}

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

export async function updatePlayerStatus(
  nickname: string,
  status: string
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(
      doc(db, "rooms", localStorage.getItem("room_id")!, "players", nickname),
      {status}
    )
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/* updatePlayerAction updates the Player's status as well since they are tied together*/
export async function updatePlayerAction(
  nickname: string,
  action: number,
): Promise<boolean> {
  const status = (action === actions.BLACK) ? "killing" : "moving";

  return new Promise((res, rej) => {
    updateDoc(
      doc(db, "rooms", localStorage.getItem("room_id")!, "players", nickname),
      {action, status}
    )
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function updatePlayerAliveness(
  nickname: string,
  alive: boolean
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(
      doc(db, "rooms", localStorage.getItem("room_id")!, "players", nickname),
      {alive}
    )
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function isPlayerAlive(nickname: string): Promise<boolean> {
  return new Promise((res, rej) => {
    getDoc(
      doc(db, "rooms", localStorage.getItem("room_id")!, "players", nickname)
    )
      .then((player) => {
        res(player.data()?.alive);
      })
      .catch((err) => {
        rej(err);
      });
  });
}
