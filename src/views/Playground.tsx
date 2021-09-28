import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Layer, Stage } from "react-konva";
import { Typography, message, Spin, Divider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Playground.css";

import Room from "../components/Room";
import Avatar from "../components/Avatar";
import Persona from "../components/Persona";
import Action, { IAction } from "../components/Action";
import PlayerStatus from "../components/PlayerStatus";

import { PlaygroundContext } from "../context/PlaygroundContext";
import {
  useListenAvatars,
  useListenPlayer,
  useListenPlayers,
  useListenRoom,
} from "../services";

export default function Playground(): React.ReactElement {
  const history = useHistory();
  const avatars = useListenAvatars();
  const [playerStats, playerAvatarProps] = useListenPlayer();
  const playersData = useListenPlayers();
  const { playerCount, roomCapacity, gameStarted, playerTurn } =
    useListenRoom(playerStats);

  const actionRef = useRef<IAction>(null);

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");
    if (!roomID) {
      message.error("no room joined!");
      history.push("/");
      return;
    }
  }, []);

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
