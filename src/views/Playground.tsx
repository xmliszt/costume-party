import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router";
import { Typography, message, Spin, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Playground.css";

import Room from "../components/Room";
import Avatar from "../components/Avatar";
import Persona from "../components/Persona";
import Action, { IAction } from "../components/Action";
import PlayerStatus from "../components/PlayerStatus";

import { PlaygroundContext } from "../context/PlaygroundContext";
import { isMyTurn } from "../controllers/player";
import {
  useListenAvatars,
  useListenPlayer,
  useListenPlayers,
  useListenRoom,
} from "../services";
import {
  getPlayerByNickname,
  isPlayerAlive,
  updatePlayerStatus,
} from "../services/player";
import {
  getRoomStates,
  isOnlyOnePlayerAlive,
  nextTurn,
  updateRoomGameState,
} from "../services/room";

export default function Playground(): React.ReactElement {
  const playerOrder = useRef(0);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const roomID = localStorage.getItem("room_id");
    const nickname = localStorage.getItem("nickname");
    if (!roomID || !nickname) {
      message.error("no room joined!");
      history.push("/");
    } else {
      const player = await getPlayerByNickname(nickname);
      const room = await getRoomStates(roomID);
      playerOrder.current = player.order;
      if (isMyTurn(player.order, room.turn, room.capacity) && player.alive) {
        updatePlayerStatus(nickname, "choosing").catch((err) =>
          message.error(err)
        );
      }
    }
  };
  const history = useHistory();
  const avatars = useListenAvatars();
  const [playerStats, playerAvatarProps] = useListenPlayer();
  const playersData = useListenPlayers();

  const onNextTurn = async (turn: number, capacity: number) => {
    const roomID = localStorage.getItem("room_id")!;
    const nickname = localStorage.getItem("nickname")!;
    if (nickname && roomID) {
      try {
        const alive = await isPlayerAlive(nickname);
        if (isMyTurn(playerOrder.current, turn, capacity)) {
          if (alive) {
            const winCondition = await isOnlyOnePlayerAlive(roomID, capacity);
            if (winCondition) {
              localStorage.setItem("win", "true");
              await updateRoomGameState(roomID, true, nickname);
            } else {
              updatePlayerStatus(nickname, "choosing");
            }
          } else {
            nextTurn(localStorage.getItem("room_id")!);
          }
        }
      } catch (err) {
        message.error("Something is wrong D: Please refresh!");
      }
    }
  };

  const {
    playerCount,
    roomCapacity,
    gameStarted,
    playerTurn,
    gameEnd,
    winner,
  } = useListenRoom(onNextTurn);

  const actionRef = useRef<IAction>(null);

  const onClearAction = (): void => {
    actionRef?.current?.clearAction();
  };

  return (
    <PlaygroundContext.Provider
      value={{
        avatars,
        playersData,
        playerStats,
        playerAvatarProps,
        playerCount,
        roomCapacity,
        playerTurn,
        gameStarted,
        gameEnd,
        winner,
      }}
    >
      <div className="title">
        <Typography.Title level={1} code copyable>
          {localStorage.getItem("room_id")}
        </Typography.Title>
        <Typography.Text style={{ color: "rgba(50, 50, 50, 0.3)" }}>
          Copy to share the Room ID with friends!
        </Typography.Text>
      </div>
      <Spin
        spinning={!gameStarted}
        indicator={<LoadingOutlined />}
        tip={`Waiting for players to join... ${playerCount}/${roomCapacity}`}
      >
        <div>
          PLAYGROUND
          <Room />
        </div>
      </Spin>
      <section className="stats">
        <Persona />
        <div style={{ display: "flex" }}>
          <Divider style={{ height: 200 }} type="vertical" />
          <Action ref={actionRef} />
          <Divider style={{ height: 200 }} type="vertical" />
        </div>
        <PlayerStatus />
      </section>
    </PlaygroundContext.Provider>
  );
}
