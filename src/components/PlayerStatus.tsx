import { List, Avatar } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./PlayerStatus.css";
import { useContext } from "react";
import { PlaygroundContext } from "../context/PlaygroundContext";
import IPlaygroundContext from "../interfaces/playground";

export default function PlayerStatus(): React.ReactElement {
  const { playersData } = useContext<IPlaygroundContext>(PlaygroundContext);
  return (
    <>
      <div className="player-status">
        <List
          itemLayout="horizontal"
          dataSource={playersData}
          renderItem={(item) => (
            <List.Item style={item.alive ? { opacity: 1 } : { opacity: 0.2 }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    icon={<QuestionCircleOutlined />}
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
