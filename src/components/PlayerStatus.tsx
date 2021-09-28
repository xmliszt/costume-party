import { useState, useEffect } from "react";
import { List, message, Avatar } from "antd";
import "./PlayerStatus.css";
import { getAllPlayers } from "../services/player";
import IPlayerProps from "../interfaces/player";

export default function PlayerStatus(): React.ReactElement {
  const [statusData, setStatusData] = useState<Array<IPlayerProps>>([]);

  useEffect(() => {
    getAllPlayers()
      .then((data) => {
        setStatusData(data);
      })
      .catch((err) => {
        message.error(err);
      });
  }, []);

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
                    style={{ border: "1px solid grey" }}
                    shape="square"
                    src={`${process.env.PUBLIC_URL}/avatars/${item.avatar}.png`}
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
