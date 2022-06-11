import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { isMobileOnly } from "react-device-detect";
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
          height: "50%",
        }}
      >
        <div className={isMobileOnly ? "persona-mobile" : "persona"}>
          <div>
            {isMobileOnly ? (
              <Typography.Text>
                You are: <b>{playerStats?.nickname}</b>
              </Typography.Text>
            ) : (
              <Typography.Title level={3}>
                You are: <b>{playerStats?.nickname}</b>
              </Typography.Title>
            )}

            <div
              className={isMobileOnly ? "avatar-mobile" : "avatar"}
              onClick={highlightAvatar}
            >
              <Avatar
                style={{ border: `5px solid ${playerAvatar?.strokeColor}` }}
                shape="square"
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
