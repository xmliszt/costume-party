import React, { useState, useEffect } from "react";
import { Layer, Stage } from "react-konva";
import Room from "../components/Room";
import Avatar from "../components/Avatar";

import "./Playground.css";
import { Typography } from "antd";
import { IAvatarProps } from "../interfaces/avatar";
import { getAllAvatarsProps } from "../services/room";

export default function Playground(): React.ReactElement {
  const [avatars, setAvatars] = useState<Array<IAvatarProps>>([]);

  useEffect(() => {
    getAllAvatars();
  }, []);

  const getAllAvatars = async (): Promise<void> => {
    return new Promise((res, rej) => {
      const roomID = localStorage.getItem("room_id");
      if (roomID) {
        getAllAvatarsProps(roomID)
          .then((avatarList) => {
            setAvatars(avatarList);
            res();
          })
          .catch((err) => {
            rej(err);
          });
      } else {
        rej("no room joined");
      }
    });
  };

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
      <Stage width={600} height={600} className="playground">
        <Room />
        <Layer>
          {avatars.map((avatar) => (
            <Avatar avatarProps={avatar} key={avatar.id} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
