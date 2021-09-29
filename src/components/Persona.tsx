import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { useContext } from "react";
import { PlaygroundContext } from "../context/PlaygroundContext";
import "./Persona.css";

export default function Persona(): React.ReactElement {
  const { playerAvatarProps, playerStats } = useContext(PlaygroundContext);

  return (
    <>
      <div className="persona">
        <Typography.Title level={5}>{playerStats?.nickname}</Typography.Title>
        <Avatar
          style={{ border: `5px solid ${playerAvatarProps?.strokeColor}` }}
          shape="square"
          size={100}
          icon={<UserOutlined />}
          src={playerAvatarProps?.imageUrl}
          alt="No Image"
        />
      </div>
    </>
  );
}
