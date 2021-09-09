import React, { useState, useRef } from "react";
import { useHistory } from "react-router";
import { Button, Divider, Input, Space, Typography } from "antd";
import {
  CheckCircleOutlined,
  RocketOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Home.css";
import { getRandomRoomID } from "../helpers/room";

export default function Home(): React.ReactElement {
  const history = useHistory();

  const roomID_1 = useRef<any>(null);
  const roomID_2 = useRef<any>(null);
  const roomID_3 = useRef<any>(null);
  const roomID_4 = useRef<any>(null);

  const [nickname, setNickname] = useState<string | null>(null);
  const [id_1, setId_1] = useState("");
  const [id_2, setId_2] = useState("");
  const [id_3, setId_3] = useState("");
  const [id_4, setId_4] = useState("");
  const [openJoinRoom, setOpenJoinRoom] = useState<boolean>(false);

  const validateNickname = (): boolean => {
    if (nickname) {
      if (nickname?.trim() === "") return false;
      if (nickname?.length >= 3) return true;
    }
    return false;
  };

  const createRoom = () => {
    const _id = getRandomRoomID();
    localStorage.setItem("room_id", _id);
    history.push("/play");
  };

  const joinRoom = () => {
    const _id = [id_1, id_2, id_3, id_4].join("");
    localStorage.setItem("room_id", _id);
    history.push("/play");
  };

  const updateRoomID = (
    e: React.ChangeEvent<HTMLInputElement>,
    position: number
  ) => {
    const _char = e.target.value.toUpperCase();
    switch (position) {
      case 0:
        setId_1(_char);
        break;
      case 1:
        setId_2(_char);
        break;
      case 2:
        setId_3(_char);
        break;
      case 3:
        setId_4(_char);
        break;
    }
    if (_char && position <= 2) {
      [roomID_1, roomID_2, roomID_3, roomID_4][position + 1].current!.focus({
        cursor: "all",
      });
    }
  };

  const renderRoomOptions = () => {
    return validateNickname() ? (
      <Space split={<Divider type="vertical" />} size="large">
        <Button size="large" onClick={createRoom}>
          Create Room
        </Button>
        <Button
          size="large"
          onClick={() => {
            setOpenJoinRoom(true);
            roomID_1.current?.focus();
          }}
        >
          Join Room
        </Button>
      </Space>
    ) : null;
  };

  const renderRoomID = () => {
    return (
      <div>
        <Divider>
          <CheckCircleOutlined />
        </Divider>
        <Typography.Title>Room ID:</Typography.Title>
        <Typography.Title code level={1} copyable>
          {"AAAA"}
        </Typography.Title>
        <Typography.Paragraph>Click to copy the roomID</Typography.Paragraph>
      </div>
    );
    return null;
  };

  return (
    <div className="home">
      <div className="home-card">
        <Typography.Title level={1} code>
          Welcome To Costume Party!
        </Typography.Title>
        <Divider>
          <StarOutlined />
        </Divider>
        <Typography.Paragraph>What's Your Name?</Typography.Paragraph>
        <Input
          style={{ marginTop: 15 }}
          size="large"
          placeholder="Enter Your Nickname..."
          prefix={<UserOutlined />}
          maxLength={12}
          allowClear
          required
          onChange={(e) => {
            setNickname(e.target.value);
          }}
        />
        <Typography.Text style={{ color: "rgba(50, 50, 50, 0.3)" }}>
          Nickname should be not less than 3 characters, and not more than 12
          characters.
        </Typography.Text>
        {validateNickname() ? (
          <Divider>
            <CheckCircleOutlined />
          </Divider>
        ) : null}
        {renderRoomOptions()}
        {openJoinRoom ? (
          <div>
            <Divider>
              <RocketOutlined />
            </Divider>
            <Typography.Title level={3}>Room ID:</Typography.Title>
            <Space>
              <Input
                ref={roomID_1}
                style={{ maxWidth: 50 }}
                size="large"
                value={id_1}
                maxLength={1}
                autoFocus
                onChange={(e) => {
                  updateRoomID(e, 0);
                }}
              />
              <Input
                ref={roomID_2}
                style={{ maxWidth: 50 }}
                size="large"
                value={id_2}
                maxLength={1}
                onChange={(e) => {
                  updateRoomID(e, 1);
                }}
              />
              <Input
                ref={roomID_3}
                style={{ maxWidth: 50 }}
                size="large"
                value={id_3}
                maxLength={1}
                onChange={(e) => {
                  updateRoomID(e, 2);
                }}
              />
              <Input
                style={{ maxWidth: 50 }}
                ref={roomID_4}
                size="large"
                value={id_4}
                maxLength={1}
                onChange={(e) => {
                  updateRoomID(e, 3);
                }}
              />
            </Space>
            <div style={{ marginTop: 15 }}>
              <Button size="large" onClick={joinRoom}>
                JOIN
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
