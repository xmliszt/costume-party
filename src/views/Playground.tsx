import React, { useEffect } from "react";
import { Layer, Stage } from "react-konva";
import Room from "../components/Room";
import Avatar from "../components/Avatar";

import "./Playground.css";
import { Typography, message, Spin } from "antd";

import { useHistory } from "react-router";
import { LoadingOutlined } from "@ant-design/icons";

import { useListenAvatars, useListenRoom } from "../services";
import Persona from "../components/Persona";

export default function Playground(): React.ReactElement {
  const history = useHistory();

  const avatars = useListenAvatars();
  const { playerCount, roomCapacity, gameStarted, playerTurn } =
    useListenRoom();

  useEffect(() => {
    const roomID = localStorage.getItem("room_id");
    if (!roomID) {
      message.error("no room joined!");
      history.push("/");
      return;
    }
  }, []);

  return (
    <div>
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
            {avatars.map((avatar) => (
              <Avatar avatarProps={avatar} key={avatar.id} />
            ))}
          </Layer>
        </Stage>
      </Spin>
      <section className="stats">
        <Persona nickname={localStorage.getItem("nickname")!} />
      </section>
    </div>
  );
}
