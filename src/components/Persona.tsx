import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, message, Typography } from "antd";
import IPersonaProps from "../interfaces/persona";
import "./Persona.css";
import { getAvatarForPlayer } from "../services/player";
import { IAvatarProps } from "../interfaces/avatar";

export default function Persona({
  nickname,
}: IPersonaProps): React.ReactElement {
  const [playerProps, setPlayerProps] = useState<IAvatarProps>();

  useEffect(() => {
    getAvatarForPlayer(nickname)
      .then((props) => {
        setPlayerProps(props);
      })
      .catch((err) => {
        message.error(err);
      });
  }, [nickname]);

  return (
    <>
      <div className="persona">
        <Typography>Find Yourself:</Typography>
        <br />
        <Avatar
          style={{ border: `5px solid ${playerProps?.strokeColor}` }}
          shape="square"
          size={100}
          icon={<UserOutlined />}
          src={playerProps?.imageUrl}
          alt="No Image"
        />
      </div>
    </>
  );
}
