import React, { useState, useEffect } from "react";
import { Layer, Stage } from "react-konva";
import Room from "../components/Room";
import Avatar from "../components/Avatar";

import "./Playground.css";
import { Typography } from "antd";
import { IAvatarProps } from "../interfaces/avatar";

export default function Playground(): React.ReactElement {
  const [avatars, setAvatars] = useState<Array<IAvatarProps>>([]);

  useEffect(() => {
    const avatarList: Array<IAvatarProps> = [];
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
