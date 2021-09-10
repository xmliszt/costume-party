import { db } from "../firebase";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getRandomInt } from "../helpers/number";
import { IAvatarProps } from "../interfaces/avatar";
import { asyncForEach } from "../helpers/async";

/**
 * Create a new room
 */
export async function createRoom(
  _id: string,
  capacity: number
): Promise<boolean> {
  return new Promise((res, rej) => {
    setDoc(doc(db, "rooms", _id), {
      _id,
      capacity,
      turn: 1,
      start: false,
      players: [],
    })
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Check if a given room ID existed in Firestore
 */
export async function isRoomExist(roomID: string): Promise<boolean> {
  return new Promise((res, rej) => {
    getDoc(doc(db, "rooms", roomID))
      .then((roomDoc) => {
        if (roomDoc.exists()) {
          res(true);
        } else {
          res(false);
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Get the total number of joined players in the room
 */
export async function getPlayerCount(roomID: string): Promise<number> {
  return new Promise((res, rej) => {
    getDocs(collection(db, "rooms", roomID, "players"))
      .then((rooms) => {
        return res(rooms.docs.length);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Get all avatar IDs that are assigned to joined players in the room
 */
export async function getPlayerAvatars(roomID: string): Promise<Array<number>> {
  return new Promise((res, rej) => {
    getDoc(doc(db, "rooms", roomID))
      .then((roomDoc) => {
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          res(data.players);
        } else {
          rej("room does not exist");
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Add the avatar ID to the list of assigned avatar IDs for joined players in the room
 */
export async function addPlayerAvatar(
  roomID: string,
  avatar: number
): Promise<boolean> {
  return new Promise((res, rej) => {
    getDoc(doc(db, "rooms", roomID))
      .then((roomDoc) => {
        if (roomDoc.exists()) {
          const data = roomDoc.data();
          const playerAvatars = data.players;
          playerAvatars.push(avatar);
          updateDoc(doc(db, "rooms", roomID), {
            players: playerAvatars,
          })
            .then(() => {
              res(true);
            })
            .catch((err) => {
              rej(err);
            });
        } else {
          rej("room does not exist");
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Join a room, and assign a random avatar ID to the joined player
 */
export async function joinRoom(
  roomID: string,
  nickname: string
): Promise<boolean | any> {
  return new Promise((res, rej) => {
    isRoomExist(roomID)
      .then(async (exist) => {
        if (exist) {
          try {
            const count = await getPlayerCount(roomID);
            const playerAvatars = await getPlayerAvatars(roomID);
            let avatarAssigned;
            while (true) {
              avatarAssigned = getRandomInt(1, 20);
              if (!playerAvatars.includes(avatarAssigned)) break;
            }
            await addPlayerAvatar(roomID, avatarAssigned);
            addDoc(collection(db, "rooms", roomID, "players"), {
              nickname,
              avatar: avatarAssigned,
              alive: true,
              order: count + 1,
            });
            res(true);
          } catch (err) {
            rej(err);
          }
        } else {
          rej("room does not exist");
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Initialize all 20 avatars props in a given room
 */
export async function initializeAvatars(
  roomID: string,
  avatars: Array<IAvatarProps>
): Promise<boolean> {
  return new Promise((res, rej) => {
    isRoomExist(roomID)
      .then(async (exist) => {
        if (exist) {
          try {
            await asyncForEach(avatars, async (avatar: IAvatarProps) => {
              await setDoc(
                doc(db, "rooms", roomID, "avatars", avatar.id.toString()),
                {
                  id: avatar.id,
                  x: avatar.position.x,
                  y: avatar.position.y,
                  strokeColor: avatar.strokeColor,
                }
              );
            });
            res(true);
          } catch (err) {
            rej(err);
          }
        } else {
          rej("room does not exist");
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}

/**
 * Initialize all 3 avatars for the global kills in a given room
 */
export async function initializeGlobals(roomID: string): Promise<boolean> {
  return new Promise((res, rej) => {
    isRoomExist(roomID)
      .then(async (exist) => {
        if (exist) {
          const globals: Array<number> = [];
          await asyncForEach([0, 1, 2], async (_) => {
            try {
              const playerAvatars = await getPlayerAvatars(roomID);
              let globalAvatar;
              while (true) {
                globalAvatar = getRandomInt(1, 20);
                if (
                  !playerAvatars.includes(globalAvatar) &&
                  !globals.includes(globalAvatar)
                )
                  break;
              }
              globals.push(globalAvatar);
              await setDoc(
                doc(db, "rooms", roomID, "globals", globalAvatar.toString()),
                {
                  alive: true,
                }
              );
              res(true);
            } catch (err) {
              rej(err);
            }
          });
        } else {
          rej("room does not exist");
        }
      })
      .catch((err) => {
        rej(err);
      });
  });
}
