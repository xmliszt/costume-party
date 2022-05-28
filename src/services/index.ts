import { useState, useEffect } from "react";
import { db } from "../firebase";
import { IAvatarProps } from "../interfaces/avatar";
import { doc, collection, DocumentData, onSnapshot } from "@firebase/firestore";
import IPlayerProps from "../interfaces/player";
import {
  getAvatarForPlayer,
  getPlayerByAvatarID,
  updatePlayerAliveness,
  updatePlayerStatus,
} from "./player";
import { getPlayerAvatars } from "./room";

interface IRoomData {
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
  onNextTurn: (turn: number, capacity: number) => void,
  onGameStarted: (state: boolean) => void
): IRoomData {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [roomCapacity, setRoomCapacity] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerTurn, setPlayerTurn] = useState<number>(0);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");

  useEffect(() => {
    setTimeout(() => {
      const roomID = localStorage.getItem("room_id");

      // Update when room data changed: player move to next turn, player join
      if (roomID) {
        onSnapshot(
          doc(db, "rooms", roomID),
          (_doc) => {
            const data = _doc.data();
            setRoomCapacity(data?.capacity);
            setPlayerCount(data?.players.length);
            setPlayerTurn(data?.turn);
            setGameEnd(data?.gameEnd);
            setWinner(data?.winner);
            if (data?.capacity === data?.players.length) {
              if (!gameStarted) {
                setGameStarted(true);
                onGameStarted(true);
              }
              onNextTurn(data?.turn, data?.capacity);
            }
          },
          (err) => {
            console.log(err);
          }
        );
      }
    }, 1000);
  }, []);

  return {
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
              try {
                console.log("Set to dead");

                const playerStats = await getPlayerByAvatarID(Number(data.id));
                updatePlayerAliveness(playerStats.nickname, false);
                updatePlayerStatus(playerStats.nickname, "dead");
              } catch (err) {
                console.log(err);
              }
            }
          });
          setAvatars(_avatars);
        },
        (err) => {
          console.log(err);
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
          console.log(err);
        }
      );
    }
  }, []);

  return players;
}
interface IPlayerData {
  playerStats: IPlayerProps | null;
  playerAvatar: IAvatarProps | null;
}

export function useListenPlayer(): IPlayerData {
  const [playerStats, setPlayerStats] = useState<IPlayerProps | null>(null);
  const [playerAvatar, setPlayerAvatar] = useState<IAvatarProps | null>(null);

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
          getAvatarForPlayer(localStorage.getItem("nickname")!)
            .then((props) => setPlayerAvatar(props))
            .catch((err) => {
              console.log(err);
            });
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }, []);

  return {
    playerStats,
    playerAvatar,
  };
}

export function useExitRoomAction(callbackAction: () => void): void {
  useEffect(() => {
    window.onbeforeunload = () => {
      callbackAction();
    };
  }, []);
}
