import { useState, useEffect } from "react";
import { db } from "../firebase";
import { IAvatarProps } from "../interfaces/avatar";
import { doc, collection, onSnapshot } from "@firebase/firestore";
import IPlayerProps from "../interfaces/player";
import {
  getAvatarForPlayer,
  getPlayerByAvatarID,
  getPlayerByNickname,
  updatePlayerAliveness,
  updatePlayerStatus,
} from "./player";
import { getPlayerAvatars } from "./room";
import { ITurn } from "../interfaces/room";
import { message } from "antd";

interface IRoomData {
  globals: number[];
  playersAvatars: number[];
  playerCount: number;
  roomCapacity: number;
  gameStarted: boolean;
  playerTurn: number;
  gameEnd: boolean;
  winner: string;
}
/**
 * Custom hook that set up a listener to listen to room status change
 * @returns room status data
 */
export function useListenRoom(
  onNextTurn: (
    playerStatus: string,
    playerOrder: number,
    turn: number,
    capacity: number
  ) => Promise<void>
): IRoomData {
  const [globals, setGlobals] = useState<number[]>([]);
  const [playersAvatars, setPlayersAvatars] = useState<number[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [roomCapacity, setRoomCapacity] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerTurn, setPlayerTurn] = useState<number>(0);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");

  useEffect(() => {
    setTimeout(() => {
      const roomID = localStorage.getItem("room_id");
      const nickname = localStorage.getItem("nickname");
      // Update when room data changed: player move to next turn, player join
      if (roomID) {
        onSnapshot(
          doc(db, "rooms", roomID),
          (_doc) => {
            const data = _doc.data();
            if (data) {
              setGlobals(data?.globals);
              setPlayersAvatars(data?.players);
              setRoomCapacity(data?.capacity);
              setPlayerCount(data?.players.length);
              setPlayerTurn(data?.turn);
              setGameEnd(data?.gameEnd);
              setWinner(data?.winner);
              if (data?.capacity === data?.players.length) {
                if (!gameStarted) {
                  setGameStarted(true);
                }
                getPlayerByNickname(nickname!)
                  .then((player) => {
                    onNextTurn(
                      player.status,
                      player.order,
                      data?.turn,
                      data?.capacity
                    ).catch((err) => {
                      message.error(err);
                    });
                  })
                  .catch((err) => {
                    message.error(err);
                  });
              }
            } else {
              message.error("The room has been removed!");
            }
          },
          (err) => {
            message.error(err);
          }
        );
      }
    }, 1000);
  }, []);

  return {
    globals,
    playersAvatars,
    playerCount,
    roomCapacity,
    gameStarted,
    playerTurn,
    gameEnd,
    winner,
  };
}

export function useListenAvatars(): IAvatarProps[] {
  const [avatars, setAvatars] = useState<Array<IAvatarProps>>([]);

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");

    if (roomID) {
      onSnapshot(
        collection(db, "rooms", roomID, "avatars"),
        async (snapshots) => {
          const _avatars: Array<IAvatarProps> = [];
          const playerAvatars = await getPlayerAvatars(roomID);

          snapshots.forEach(async (_doc) => {
            const data = _doc.data();
            _avatars.push({
              id: data.id,
              positionIdx: data.positionIdx,
              strokeColor: data.strokeColor,
              imageUrl: `${process.env.PUBLIC_URL}/avatars/${data.id}.png`,
              dead: data.dead,
            });
            if (data.dead && playerAvatars.includes(Number(data.id))) {
              getPlayerByAvatarID(Number(data.id))
                .then((playerStats) => {
                  updatePlayerAliveness(playerStats.nickname, false);
                  updatePlayerStatus(playerStats.nickname, "dead");
                })
                .catch((err) => {
                  message.error(err);
                });
            }
          });
          setAvatars(_avatars);
        },
        (err) => {
          message.error(err);
        }
      );
    }
  }, []);

  return avatars;
}

export function useListenPlayers(): IPlayerProps[] {
  const [players, setPlayers] = useState<Array<IPlayerProps>>([]);

  useEffect(() => {
    if (localStorage.getItem("room_id")) {
      onSnapshot(
        collection(db, "rooms", localStorage.getItem("room_id")!, "players"),
        (snapshots) => {
          const _players: Array<IPlayerProps> = [];

          snapshots.forEach((_doc) => {
            const data = _doc.data();
            _players.push({
              nickname: data.nickname,
              alive: data.alive,
              order: data.order,
              avatar: data.avatar,
              action: data.action,
              message: data.message,
              status: data.status,
            });
          });
          setPlayers(_players);
        },
        (err) => {
          message.error(err);
        }
      );
    }
  }, []);

  return players;
}

export interface IPlayerData {
  playerStats: IPlayerProps | null;
}
export function useListenPlayer(): IPlayerData {
  const [playerStats, setPlayerStats] = useState<IPlayerProps | null>(null);

  useEffect(() => {
    if (localStorage.getItem("room_id")) {
      onSnapshot(
        doc(
          db,
          "rooms",
          localStorage.getItem("room_id")!,
          "players",
          localStorage.getItem("nickname")!
        ),
        (_doc) => {
          const data = _doc.data();
          setPlayerStats({
            nickname: data?.nickname,
            alive: data?.alive,
            order: data?.order,
            avatar: data?.avatar,
            action: data?.action,
            message: data?.message,
            status: data?.status,
          });
        },
        (err) => {
          message.error(err);
        }
      );
    }
  }, []);

  return {
    playerStats,
  };
}

export function useExitRoomAction(callbackAction: () => void): void {
  useEffect(() => {
    window.onbeforeunload = () => {
      callbackAction();
    };
  }, []);
}

export function useListenTurns(): ITurn[] {
  const [turns, setTurns] = useState<ITurn[]>([]);

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");

    if (roomID) {
      onSnapshot(
        collection(db, "rooms", roomID, "turns"),
        (snapshots) => {
          const _turns: ITurn[] = [];
          snapshots.forEach((_doc) => {
            const data = _doc.data();
            _turns.push({
              turn: data.turn,
              actor: data.actor,
              status: data.status,
              action: data.action,
              fromPosition: data.fromPosition,
              fromRoom: data.fromRoom,
              toRoom: data.toRoom,
              toPosition: data.toPosition,
              avatarID: data.avatarID,
              killedPlayer: data.killedPlayer,
            });
          });
          setTurns(_turns.sort((a, b) => a.turn - b.turn));
        },
        (err) => {
          message.error(err);
        }
      );
    }
  }, []);

  return turns;
}
