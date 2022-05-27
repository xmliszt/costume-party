import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router";
import { Typography, message, Spin, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Playground.css";

import Room, { IRoomRef } from "../components/Room";
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
import { isMobile } from "react-device-detect";

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

  const roomRef = useRef<IRoomRef>(null);

  const renderStats = () => {
    if (isMobile) {
      return (
        <section className="stats-mobile">
          <Action
            ref={actionRef}
            onPlayerMove={roomRef.current?.onPlayerMove}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Persona />
            <PlayerStatus />
          </div>
        </section>
      );
    } else {
      return (
        <section className="stats">
          <Persona />
          <div style={{ display: "flex" }}>
            <Divider style={{ height: 200 }} type="vertical" />
            <Action
              ref={actionRef}
              onPlayerMove={roomRef.current?.onPlayerMove}
            />
            <Divider style={{ height: 200 }} type="vertical" />
          </div>
          <PlayerStatus />
        </section>
      );
    }
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
        <Room ref={roomRef} />
      </Spin>
      {renderStats()}
    </PlaygroundContext.Provider>
  );
}
