import { List, Avatar } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./PlayerStatus.css";
import { useContext } from "react";
import { PlaygroundContext } from "../context/PlaygroundContext";
import IPlaygroundContext from "../interfaces/playground";
import { useThemeSwitcher } from "react-css-theme-switcher";

export default function PlayerStatus(): React.ReactElement {
  const { playersData } = useContext<IPlaygroundContext>(PlaygroundContext);
  const { currentTheme } = useThemeSwitcher();
  return (
    <>
      <div className="player-status">
        <div
          className={
            currentTheme === "light"
              ? "gradient-overlay-up light-gradient-up"
              : "gradient-overlay-up dark-gradient-up"
          }
        ></div>
        <List
          itemLayout="horizontal"
          size="large"
          dataSource={playersData}
          renderItem={(item) => (
            <List.Item style={item.alive ? { opacity: 1 } : { opacity: 0.4 }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    icon={item.alive ? <QuestionCircleOutlined /> : null}
                    src={
                      item.alive
                        ? ""
                        : `${process.env.PUBLIC_URL}/avatars/${item.avatar}.png`
                    }
                  />
                }
                title={item.nickname}
                description={item.alive ? item.status + "..." : "Dead"}
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
}
