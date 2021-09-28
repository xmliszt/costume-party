import { useState, useEffect } from "react";
import { db } from "../firebase";
import { IAvatarProps } from "../interfaces/avatar";
import { doc, collection, DocumentData, onSnapshot } from "@firebase/firestore";

/**
 * Custom hook that set up a listener to listen to room status change
 * @returns room status data
 */
export function useListenRoom(): DocumentData {
  const [playerCount, setPlayerCount] = useState(0);
  const [roomCapacity, setRoomCapacity] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerTurn, setPlayerTurn] = useState(0);

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");

    if (roomID) {
      onSnapshot(
        doc(db, "rooms", roomID!),
        (doc) => {
          const data = doc.data();
          console.log(data);
          setRoomCapacity(data?.capacity);
          setPlayerCount(data?.players.length);
          setPlayerTurn(data?.turn);
          if (data?.capacity === data?.players.length) {
            setGameStarted(true);
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }, []);

  return {
    playerCount,
    roomCapacity,
    gameStarted,
    playerTurn,
  };
}

export function useListenAvatars(): IAvatarProps[] {
  const [avatars, setAvatars] = useState<Array<IAvatarProps>>([]);

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");

    if (roomID) {
      onSnapshot(
        collection(db, "rooms", roomID!, "avatars"),
        (snapshots) => {
          const _avatars: Array<IAvatarProps> = [];

          snapshots.forEach((doc) => {
            const data = doc.data();
            _avatars.push({
              id: data.id,
              position: {
                x: data.x,
                y: data.y,
              },
              strokeColor: data.strokeColor,
              imageUrl: `${process.env.PUBLIC_URL}/avatars/${data.id}.png`,
            });
          });
          console.log(_avatars);

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
