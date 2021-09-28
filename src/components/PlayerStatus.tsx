import { List, Avatar } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./PlayerStatus.css";
import { useListenPlayers } from "../services";
import IPlayerProps from "../interfaces/player";

export default function PlayerStatus(): React.ReactElement {
  const statusData = useListenPlayers();

  return (
    <>
      <div className="player-status">
        <List
          itemLayout="horizontal"
          dataSource={statusData}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size="large"
                    icon={<QuestionCircleOutlined />}
                  />
                }
                title={item.nickname}
                description={item.status + "..."}
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
}
