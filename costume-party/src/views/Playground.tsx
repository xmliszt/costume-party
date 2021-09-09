import React, { useState, useEffect } from "react";
import { Layer, Stage } from "react-konva";
import Room from "../components/Room";
import Avatar from "../components/Avatar";
import {
  generateAvatarColorLight,
  generateAvatarPosition,
} from "../helpers/avatar";
import "./Playground.css";
import IAvatars from "../interfaces/playground";
import { roomColorMapping } from "../constants";
import { Typography } from "antd";

export default function Playground(): React.ReactElement {
  const [avatars, setAvatars] = useState<Array<IAvatars>>([]);

  useEffect(() => {
    const avatarList: Array<IAvatars> = [];
    const rooms = ["TL", "TR", "BL", "BR", "C"];
    let _id = 1;
    rooms.forEach((room) => {
      for (let i = 0; i < 4; i++) {
        avatarList.push({
          id: _id,
          position: generateAvatarPosition(room),
          imageUrl: `${process.env.PUBLIC_URL}/avatars/${_id}.png`,
          strokeColor: roomColorMapping[room],
        });
        _id++;
      }
    });
    console.log(avatarList);
    setAvatars(avatarList);
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
