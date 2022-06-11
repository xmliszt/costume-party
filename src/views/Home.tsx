import React, { useState, useRef, useEffect, useContext } from "react";
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
  isRoomExist,
  joinRoom,
} from "../services/room";
import { generateAvatarPosition } from "../helpers/avatar";
import { roomColorMapping } from "../constants";
import { IAvatarProps } from "../interfaces/avatar";
import { isMobileOnly } from "react-device-detect";
import { useThemeSwitcher } from "react-css-theme-switcher";

interface IHomeProp {
  changeLocation(location: string): void;
}

export default function Home({
  changeLocation,
}: IHomeProp): React.ReactElement {
  const history = useHistory();
  const { currentTheme } = useThemeSwitcher();

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

  useEffect(() => {
    changeLocation("home");
    if (localStorage.getItem("nickname")) {
      setNickname(localStorage.getItem("nickname")!);
    }
  }, []);

  const initializeAvatarPositions = (): Array<IAvatarProps> => {
    const avatarList: Array<IAvatarProps> = [];
    const rooms = ["TL", "TR", "BL", "BR", "C"];
    const selectedPositions: Array<number> = [];
    let _id = 1;
    rooms.forEach((room) => {
      for (let i = 0; i < 4; i++) {
        while (true) {
          const positionIdx = generateAvatarPosition(room);
          if (!selectedPositions.includes(positionIdx)) {
            avatarList.push({
              id: _id.toString(),
              positionIdx: positionIdx,
              imageUrl: `${process.env.PUBLIC_URL}/avatars/${_id}.png`,
              strokeColor: roomColorMapping[room],
              dead: false,
            });
            selectedPositions.push(positionIdx);
            _id++;
            break;
          }
        }
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
      await joinRoom(_id, nickname.trim());
      localStorage.setItem("nickname", nickname.trim());
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
        message.error("Invalid Room ID");
      } else if (!(await isRoomExist(_id))) {
        message.error("Room does not exist!");
      } else {
        localStorage.setItem("nickname", nickname.trim());
        await joinRoom(_id, nickname.trim());
        localStorage.setItem("room_id", _id);
        setLoading(false);
        history.push("/play");
      }
    } catch (err: any) {
      console.log(err);
      message.error("Unable to join room");
    } finally {
      setLoading(false);
    }
  };

  const onKeyPressed = (
    e: React.KeyboardEvent<HTMLInputElement>,
    position: number
  ) => {
    const key = e.key;
    const textFields = [roomID_1, roomID_2, roomID_3, roomID_4];
    const values = [id_1, id_2, id_3, id_4];
    if (key === "Backspace" || key === "Delete") {
      if (values[position] !== "") {
        switch (position) {
          case 0:
            setId_1("");
            break;
          case 1:
            setId_2("");
            break;
          case 2:
            setId_3("");
            break;
          case 3:
            setId_4("");
            break;
          default:
            break;
        }
      }
      if (position > 0) {
        textFields[position - 1]?.current.focus({ cursor: "all" });
      }
    }
  };

  const updateRoomID = (
    e: React.ChangeEvent<HTMLInputElement>,
    position: number
  ) => {
    const value = e.target.value.toUpperCase();
    const textFields = [roomID_1, roomID_2, roomID_3, roomID_4];

    for (let i = position; i < 4; i++) {
      const _char = value[i - position] ?? "";
      switch (i) {
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
        default:
          break;
      }
      if (_char) {
        textFields[i + 1]?.current.focus({ cursor: "all" });
      } else {
        return;
      }
    }
  };

  return (
    <div
      className={isMobileOnly ? "home mobile" : "home"}
      style={{
        backgroundImage:
          currentTheme === "light"
            ? `url(${process.env.PUBLIC_URL}/bg-light.jpeg)`
            : `url(${process.env.PUBLIC_URL}/bg-dark.jpeg)`,
      }}
    >
      <Spin spinning={loading} indicator={<LoadingOutlined />}>
        <div
          className={
            isMobileOnly
              ? currentTheme === "light"
                ? "home-card-mobile"
                : "home-card-mobile-dark"
              : currentTheme === "light"
              ? "home-card"
              : "home-card-dark"
          }
        >
          <Typography.Title level={isMobileOnly ? 3 : 1} code>
            Welcome To Costume Party! 🎉
          </Typography.Title>
          <Divider>
            <i>Party Invitation Card</i>
          </Divider>
          <Typography.Text>
            Hello! Sir/Madam, how may we address you?
          </Typography.Text>
          <Input
            style={{ marginTop: 15 }}
            size="large"
            placeholder="Enter Your Nickname..."
            defaultValue={nickname}
            value={nickname}
            prefix={<UserOutlined />}
            maxLength={12}
            allowClear
            required
            onChange={(e) => {
              setNickname(e.target.value);
            }}
          />
          <Typography.Text type="secondary">
            Nickname should be not less than 3 characters, and not more than 12
            characters.
          </Typography.Text>
          {validateNickname(nickname) ? (
            <div>
              <Divider>Create A Room</Divider>
              <Space size="large">
                <Button type="primary" size="large" onClick={createARoom}>
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
              <Typography.Title level={isMobileOnly ? 5 : 3}>
                Room ID:
              </Typography.Title>
              <Space>
                <Input
                  ref={roomID_1}
                  style={{ maxWidth: 50 }}
                  size="large"
                  value={id_1}
                  onKeyDown={(e) => {
                    onKeyPressed(e, 0);
                  }}
                  onChange={(e) => {
                    updateRoomID(e, 0);
                  }}
                />
                <Input
                  ref={roomID_2}
                  style={{ maxWidth: 50 }}
                  size="large"
                  value={id_2}
                  onKeyDown={(e) => {
                    onKeyPressed(e, 1);
                  }}
                  onChange={(e) => {
                    updateRoomID(e, 1);
                  }}
                />
                <Input
                  ref={roomID_3}
                  style={{ maxWidth: 50 }}
                  size="large"
                  value={id_3}
                  onKeyDown={(e) => {
                    onKeyPressed(e, 2);
                  }}
                  onChange={(e) => {
                    updateRoomID(e, 2);
                  }}
                />
                <Input
                  style={{ maxWidth: 50 }}
                  ref={roomID_4}
                  size="large"
                  value={id_4}
                  onKeyDown={(e) => {
                    onKeyPressed(e, 3);
                  }}
                  onChange={(e) => {
                    updateRoomID(e, 3);
                  }}
                />
              </Space>
              <div style={{ marginTop: 15 }}>
                <Button type="primary" size={"large"} onClick={joinARoom}>
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
