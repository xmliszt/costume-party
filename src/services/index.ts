import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, DocumentData, onSnapshot } from "@firebase/firestore";

/**
 * Custom hook that set up a listener to listen to room status change
 * @returns room status data
 */
export function useListen(): DocumentData {
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
