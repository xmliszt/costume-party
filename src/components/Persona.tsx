import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { PlaygroundContext } from "../context/PlaygroundContext";
import { getPlayerAvatar } from "../helpers/avatar";
import { IAvatarProps } from "../interfaces/avatar";
import IPlaygroundContext from "../interfaces/playground";
import "./Persona.css";

export default function Persona(): React.ReactElement {
  const { avatars, playerStats } =
    useContext<IPlaygroundContext>(PlaygroundContext);
  const [playerAvatar, setPlayerAvatar] = useState<IAvatarProps | null>();

  useEffect(() => {
    const avatar = getPlayerAvatar(avatars, playerStats);
    setPlayerAvatar(avatar);
  }, [avatars]);

  const highlightAvatar = () => {
    const playerSlot = document.getElementById("playerSlot");
    playerSlot &&
      playerSlot.classList.add(
        "animate__animated",
        "animate__heartBeat",
        "animate__repeat-1"
      );
    setTimeout(() => {
      playerSlot!.classList.remove(
        "animate__animated",
        "animate__heartBeat",
        "animate__repeat-1"
      );
    }, 1000);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div className={isMobile ? "persona-mobile" : "persona"}>
          <div>
            <Typography.Title level={5}>
              {playerStats?.nickname}
            </Typography.Title>
            <div className="avatar" onClick={highlightAvatar}>
              <Avatar
                style={{ border: `5px solid ${playerAvatar?.strokeColor}` }}
                shape="square"
                size={isMobile ? 50 : 100}
                icon={<UserOutlined />}
                src={playerAvatar?.imageUrl}
                alt="No Image"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
