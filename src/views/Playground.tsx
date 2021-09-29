import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Layer, Stage } from "react-konva";
import { Typography, message, Spin, Divider, Modal } from "antd";
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
  useExitRoomAction,
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
  deleteRoom,
  getRoomStates,
  isOnlyOnePlayerAlive,
  updateRoomGameState,
} from "../services/room";

export default function Playground(): React.ReactElement {
  const playerOrder = useRef(0);

  useExitRoomAction(async () => {
    const roomID = localStorage.getItem("room_id");
    console.log("Delete Room: " + roomID);
    await deleteRoom(roomID!);
  });

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
        console.log("Set to choosing");
        updatePlayerStatus(nickname, "choosing").catch((err) =>
          message.error(err)
        );
      }
    }
  };

  const onNextTurn = async (turn: number, capacity: number) => {
    const roomID = localStorage.getItem("room_id")!;
    const nickname = localStorage.getItem("nickname")!;
    if (nickname && roomID) {
      try {
        const alive = await isPlayerAlive(nickname);
        console.log(playerOrder.current, turn, capacity, alive);
        if (isMyTurn(playerOrder.current, turn, capacity) && alive) {
          const winCondition = await isOnlyOnePlayerAlive(roomID, capacity);
          if (winCondition) {
            await updateRoomGameState(roomID, true, nickname);
            setTimeout(() => {
              Modal.success({
                title: "Good Game!",
                okText: "Back To Home",
                onOk: () => {
                  deleteRoom(roomID);
                  message.warn("Welcome Back!");
                  history.push("/");
                },
              });
            }, 2000);
          } else {
            console.log("Set to choosing");
            updatePlayerStatus(nickname, "choosing");
          }
        }
      } catch (err) {
        message.error("Something is wrong D: Please refresh!");
      }
    }
  };

  const history = useHistory();
  const avatars = useListenAvatars();
  const [playerStats, playerAvatarProps] = useListenPlayer();
  const playersData = useListenPlayers();
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
        <Stage width={600} height={600} className="playground">
          <Room />
          <Layer>
            {avatars?.map((avatar) => (
              <Avatar
                avatarProps={avatar}
                key={avatar.id}
                isMoving={playerStats?.status === "moving"}
                isKilling={playerStats?.status === "killing"}
                onClearAction={onClearAction}
              />
            ))}
          </Layer>
        </Stage>
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
