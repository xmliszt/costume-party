import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography } from "antd";
import { useContext } from "react";
import { isMobile } from "react-device-detect";
import { PlaygroundContext } from "../context/PlaygroundContext";
import "./Persona.css";

export default function Persona(): React.ReactElement {
  const { playerAvatar, playerStats } = useContext(PlaygroundContext);

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
    </>
  );
}
