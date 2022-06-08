import { db } from "../firebase";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  deleteDoc,
} from "@firebase/firestore";
import { getRandomInt } from "../helpers/number";
import { IAvatarProps } from "../interfaces/avatar";
import { asyncForEach } from "../helpers/async";
import { IRoom, ITurn } from "../interfaces/room";
import { getAllPlayers, isPlayerAlive, updatePlayerStatus } from "./player";
import { isMyTurn } from "../controllers/player";

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
      players: [],
      globals: [],
      gameEnd: false,
      winner: "",
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
            const roomStats = await getRoomStates(roomID);
            const players = await getAllPlayers(roomID);
            const count = players.length;
            const nickNameExist =
              players.filter((player) => player.nickname === nickname).length >
              0;
            if (roomStats.capacity <= count && !nickNameExist) {
              rej("room is full");
            }
            if (nickNameExist) {
              res(true);
            } else {
              const playerAvatars = roomStats.players;
              let avatarAssigned;
              while (true) {
                avatarAssigned = getRandomInt(1, 20);
                if (!playerAvatars.includes(avatarAssigned)) break;
              }
              await addPlayerAvatar(roomID, avatarAssigned);
              setDoc(doc(db, "rooms", roomID, "players", nickname), {
                nickname,
                avatar: avatarAssigned,
                alive: true,
                order: count + 1,
                status: "waiting", //
                action: null, // constants.ts -- actions
                message: "", // action message
              });
              res(true);
            }
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
                  positionIdx: avatar.positionIdx,
                  strokeColor: avatar.strokeColor,
                  dead: avatar.dead,
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
          getPlayerAvatars(roomID)
            .then((playerAvatars) => {
              while (globals.length < 3) {
                const globalAvatar = getRandomInt(1, 20);
                if (
                  !playerAvatars.includes(globalAvatar) &&
                  !globals.includes(globalAvatar)
                )
                  globals.push(globalAvatar);
              }
              updateDoc(doc(db, "rooms", roomID), {
                globals: globals,
              })
                .then(() => res(true))
                .catch((err) => rej(err));
            })
            .catch((err) => rej(err));
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
export async function addTurn(roomID: string, turn: ITurn): Promise<boolean> {
  return new Promise((res, rej) => {
    isRoomExist(roomID)
      .then(async (exist) => {
        if (exist) {
          try {
            await setDoc(
              doc(
                db,
                "rooms",
                roomID,
                "turns",
                turn.turn.toString() + turn.status.toLowerCase()
              ),
              {
                turn: turn.turn,
                actor: turn.actor,
                status: turn.status,
                action: turn.action,
                fromRoom: turn.fromRoom,
                toRoom: turn.toRoom,
                fromPosition: turn.fromPosition,
                toPosition: turn.toPosition,
                avatarID: turn.avatarID,
                killedPlayer: turn.killedPlayer,
              }
            );
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

export async function getAllAvatarsProps(
  roomID: string
): Promise<Array<IAvatarProps>> {
  return new Promise((res, rej) => {
    getDocs(collection(db, "rooms", roomID, "avatars"))
      .then((snapshot) => {
        const avatars: Array<IAvatarProps> = [];
        snapshot.forEach((avatarDoc) => {
          const data = avatarDoc.data();
          const avatar = {
            id: data.id,
            positionIdx: data.positionIdx,
            strokeColor: data.strokeColor,
            imageUrl: `${process.env.PUBLIC_URL}/avatars/${data.id}.png`,
            dead: data.dead,
          };
          avatars.push(avatar);
        });
        res(avatars);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function getRoomStates(roomID: string): Promise<IRoom> {
  return new Promise((res, rej) => {
    getDoc(doc(db, "rooms", roomID))
      .then((roomDoc) => {
        const data = roomDoc.data() as IRoom;
        if (data) res(data);
        else rej("no room data available");
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function nextTurn(roomID: string): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(doc(db, "rooms", roomID), { turn: increment(1) })
      .then(() => {
        res(true);
      })
      .catch((err) => rej(err));
  });
}

export async function isOnlyOnePlayerAlive(
  roomID: string,
  capacity: number
): Promise<boolean> {
  return new Promise((res, rej) => {
    let counter = 0;
    getDocs(collection(db, "rooms", roomID, "players"))
      .then((snapshots) => {
        if (snapshots.size < capacity) {
          res(false);
        } else {
          snapshots.forEach((player) => {
            const data = player.data();
            if (data?.alive) counter++;
          });
          res(counter == 1);
        }
      })
      .catch((err) => rej(err));
  });
}

export async function updateRoomGameState(
  roomID: string,
  gameEnd: boolean,
  winner: string
): Promise<boolean> {
  return new Promise((res, rej) => {
    updateDoc(doc(db, "rooms", roomID), { gameEnd, winner })
      .then(() => {
        res(true);
      })
      .catch((err) => {
        rej(err);
      });
  });
}

export async function deleteRoom(roomID: string): Promise<boolean> {
  return new Promise((res, rej) => {
    localStorage.removeItem("room_id");
    deleteDoc(doc(db, "rooms", roomID))
      .then(() => res(true))
      .catch((err) => rej(err));
  });
}

export async function onNextTurn(
  playerStatus: string,
  playerOrder: number,
  turn: number,
  capacity: number
): Promise<void> {
  const roomID = localStorage.getItem("room_id")!;
  const nickname = localStorage.getItem("nickname")!;
  return new Promise((res, rej) => {
    if (nickname && roomID) {
      isPlayerAlive(nickname)
        .then((alive) => {
          if (isMyTurn(playerOrder, turn, capacity)) {
            if (alive) {
              isOnlyOnePlayerAlive(roomID, capacity)
                .then((isAWin) => {
                  if (isAWin) {
                    updateRoomGameState(roomID, true, nickname);
                    res();
                  } else {
                    if (
                      playerStatus === "choosing" ||
                      playerStatus === "waiting"
                    ) {
                      updatePlayerStatus(nickname, "choosing");
                      addTurn(localStorage.getItem("room_id")!, {
                        turn: turn,
                        actor: nickname,
                        status: "choosing",
                        action: null,
                        fromRoom: null,
                        toRoom: null,
                        fromPosition: null,
                        toPosition: null,
                        avatarID: null,
                        killedPlayer: null,
                      });
                    }
                    res();
                  }
                })
                .catch((err) => rej(err));
            } else {
              nextTurn(localStorage.getItem("room_id")!);
            }
          } else {
            updatePlayerStatus(nickname, "waiting");
          }
        })
        .catch((err) => {
          rej(err);
        });
    }
  });
}
