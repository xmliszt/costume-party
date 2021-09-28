import React, { useState, useRef } from "react";
import { useHistory } from "react-router";
import {
  Button,
  Divider,
  Input,
  Space,
  Typography,
  Select,
  message,
  Spin,
} from "antd";
import { LoadingOutlined, StarOutlined, UserOutlined } from "@ant-design/icons";
import "./Home.css";
import { getRandomRoomID } from "../helpers/room";
import { validateNickname } from "../controllers/player";
import {
  createRoom,
  initializeAvatars,
  initializeGlobals,
  isRoomExist,
  joinRoom,
} from "../services/room";
import { generateAvatarPosition } from "../helpers/avatar";
import { roomColorMapping } from "../constants";
import { IAvatarProps } from "../interfaces/avatar";

export default function Home(): React.ReactElement {
  const history = useHistory();

  const roomID_1 = useRef<any>(null);
  const roomID_2 = useRef<any>(null);
  const roomID_3 = useRef<any>(null);
  const roomID_4 = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [capacity, setCapacity] = useState<number>(2);
  const [nickname, setNickname] = useState<string>("");
  const [id_1, setId_1] = useState("");
  const [id_2, setId_2] = useState("");
  const [id_3, setId_3] = useState("");
  const [id_4, setId_4] = useState("");

  const initializeAvatarPositions = (): Array<IAvatarProps> => {
    const avatarList: Array<IAvatarProps> = [];
    const rooms = ["TL", "TR", "BL", "BR", "C"];
    let _id = 1;
    rooms.forEach((room) => {
      for (let i = 0; i < 4; i++) {
        avatarList.push({
          id: _id.toString(),
          position: generateAvatarPosition(room),
          imageUrl: `${process.env.PUBLIC_URL}/avatars/${_id}.png`,
          strokeColor: roomColorMapping[room],
        });
        _id++;
      }
    });
    return avatarList;
  };

  const createARoom = async () => {
    try {
      setLoading(true);
      let _id;
      while (true) {
        _id = getRandomRoomID();
        if (!(await isRoomExist(_id))) break;
      }

      await createRoom(_id, capacity);
      await initializeAvatars(_id, initializeAvatarPositions());
      await initializeGlobals(_id);
      await joinRoom(_id, nickname);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("room_id", _id);
      message.success("Room created: " + _id);
      setLoading(false);
      history.push("/play");
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      message.error("Failed to create a room");
    }
  };

  const joinARoom = async () => {
    try {
      setLoading(true);
      const _id = [id_1, id_2, id_3, id_4].join("");
      if (_id.replaceAll(" ", "").length < 4) {
        setLoading(false);
        message.error("Invalid Room ID");
      } else if (!(await isRoomExist(_id))) {
        setLoading(false);
        message.error("Room does not exist!");
      } else {
        await joinRoom(_id, nickname);
        setLoading(false);
        localStorage.setItem("room_id", _id);
        history.push("/play");
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      message.error(err);
    }
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
      [roomID_1, roomID_2, roomID_3, roomID_4][position + 1].current.focus({
        cursor: "all",
      });
    }
  };

  return (
    <div className="home">
      <Spin spinning={loading} indicator={<LoadingOutlined />}>
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
              setNickname(e.target.value.trim());
            }}
          />
          <Typography.Text style={{ color: "rgba(50, 50, 50, 0.3)" }}>
            Nickname should be not less than 3 characters, and not more than 12
            characters.
          </Typography.Text>
          {validateNickname(nickname) ? (
            <div>
              <Divider>Create A Room</Divider>
              <Space size="large">
                <Button size="large" onClick={createARoom}>
                  CREATE
                </Button>

                <Space>
                  <Select
                    size="large"
                    defaultValue={2}
                    value={capacity}
                    onChange={(val) => {
                      setCapacity(val);
                    }}
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <Select.Option key={i} value={i}>
                        {i}
                      </Select.Option>
                    ))}
                  </Select>
                  <Typography.Text>players</Typography.Text>
                </Space>
              </Space>
              <Divider>Join A Room</Divider>
              <Typography.Title level={3}>Room ID:</Typography.Title>
              <Space>
                <Input
                  ref={roomID_1}
                  style={{ maxWidth: 50 }}
                  size="large"
                  value={id_1}
                  maxLength={1}
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
                <Button size="large" onClick={joinARoom}>
                  JOIN
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Spin>
    </div>
  );
}
