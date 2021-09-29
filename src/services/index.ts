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

/**
 * Custom hook that set up a listener to listen to room status change
 * @returns room status data
 */
export function useListenRoom(
  onNextTurn: (turn: number, capacity: number) => void
): DocumentData {
  const [playerCount, setPlayerCount] = useState(0);
  const [roomCapacity, setRoomCapacity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [gameEnd, setGameEnd] = useState(false);
  const [winner, setWinner] = useState("");

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
              !gameStarted && setGameStarted(true);
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
              position: {
                x: data.x,
                y: data.y,
              },
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

export function useListenPlayer(): [IPlayerProps, IAvatarProps] {
  const [playerStats, setPlayerStats] = useState<IPlayerProps>();
  const [playerAvatarProps, setPlayerAvatarProps] = useState<IAvatarProps>();

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
            .then((props) => setPlayerAvatarProps(props))
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

  return [playerStats!, playerAvatarProps!];
}
