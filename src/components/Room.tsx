import { Button, Row, Col, Space } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./Room.css";
import {
  roomColorMapping,
  GRID,
  COLORS,
  actionToColorStringMapping,
  colorRoomMapping,
} from "../constants";
import {
  generateRoomToPositionIdx,
  getAvailableMovingRooms,
  getAvailablePickingRooms,
  getUnAvailableMovingRooms,
  isInWhichRoom,
  makeSlotProps,
} from "../helpers/room";
import { isMobile } from "react-device-detect";
import { IAvatarProps } from "../interfaces/avatar";
import { getAllAvatarsProps } from "../services/room";
import { getAvatarForPlayer } from "../services/player";
import { ISlot } from "../interfaces/room";
import { v4 as uuidv4 } from "uuid";

export interface IRoomRef {
  onPlayerMove(_action: number): void;
  onPlayerPick(_action: number): void;
  onGameStarted(state: boolean): void;
}

const Room = forwardRef<IRoomRef, any>((props, ref): React.ReactElement => {
  useImperativeHandle(ref, () => ({
    onPlayerMove,
    onPlayerPick,
    onGameStarted,
  }));

  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [grid, setGrid] = useState<ISlot[][]>([]);
  const [slotsEnabled, setSlotsEnabled] = useState<{
    [key: number]: boolean;
  }>({});
  const [slotsClassName, setSlotsClassName] = useState<{
    [key: number]: string;
  }>({});
  const [slotsStyles, setSlotsStyles] = useState<{
    [key: number]: { [key: string]: string };
  }>({});
  const [avatars, setAvatars] = useState<IAvatarProps[]>([]);
  const [avatarsIds, setAvatarsIds] = useState<Array<number>>([]);
  const [avatarsMap, setAvatarsMap] = useState<{
    [key: number]: IAvatarProps;
  }>({});
  const [hasUndo, setHasUndo] = useState<boolean>(false);
  const [slotSelected, setSlotSelected] = useState<number | null>(null);
  const [actionSelected, setActionSelected] = useState<number | null>(null);

  const onGameStarted = (state: boolean) => {
    console.log("Set game started to " + state);

    setGameStarted(state);
  };

  const makeSlot = (slotIdx: number) => (
    <Button
      id={`slot-${slotIdx}`}
      className={slotsClassName[slotIdx] ?? "slot-normal"}
      style={slotsStyles[slotIdx]}
      ghost
      disabled={!slotsEnabled[slotIdx] ?? false}
      size={isMobile ? "small" : "large"}
      icon={<div style={{ width: 0, height: 0 }}></div>}
      onClick={() => {
        onSlotSelected(slotIdx);
      }}
    ></Button>
  );

  const onSlotSelected = (slotIdx: number) => {
    console.log("Selected slot: " + slotIdx);

    setHasUndo(true);
    setSlotSelected(slotIdx);
    const inRoomType = isInWhichRoom(slotIdx);
    const availableMovingRooms = getAvailableMovingRooms(inRoomType!);

    for (
      let index = 0;
      index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
      index++
    ) {
      console.log(slotIdx, index);

      if (index !== slotIdx) {
        const roomType = isInWhichRoom(index);
        if (
          availableMovingRooms.includes(roomType!) &&
          !avatarsIds.includes(index)
        ) {
          highlighSlot(index);
        } else {
          disableSlot(index);
        }
      } else {
        highlighSlot(index);
      }
    }
  };

  const undo = () => {
    const roomType =
      colorRoomMapping[COLORS[actionToColorStringMapping[actionSelected!]]];
    highlightAvailableAvatarSlots(roomType);
    setSlotSelected(null);
    setHasUndo(false);
  };

  const clearAllSlots = () => {
    setSlotsStyles((slotStyles) => {
      const oldSlotStyles: {
        [key: number]: { [key: string]: string };
      } = {};
      for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
        for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
          const index = row * 12 + col;
          const slotProps = makeSlotProps(index, row, col);
          const slotStyle = {
            backgroundImage: "none",
            backgroundColor: roomColorMapping[slotProps.roomType] + "70",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            border: "0px",
          };
          oldSlotStyles[index] = slotStyle;
        }
      }
      return oldSlotStyles;
    });
  };

  const init = async () => {
    clearAllSlots();
    const tmpAvatarsMap: { [key: number]: IAvatarProps } = {};
    const avatars = await getAllAvatarsProps(localStorage.getItem("room_id")!);
    setAvatars(avatars);
    const avatarPositionIdxs: Array<number> = [];
    avatars.forEach((avatar) => {
      avatarPositionIdxs.push(avatar.positionIdx);
      tmpAvatarsMap[avatar.positionIdx] = avatar;
    });

    setAvatarsIds(avatarPositionIdxs);
    setAvatarsMap(tmpAvatarsMap);

    const tmpGrid = [];
    const tmpSlotsEnabled: { [key: number]: boolean } = {};
    const tmpSlotsClassName: { [key: number]: string } = {};
    const tmpSlotsStyles: { [key: number]: { [key: string]: string } } = {};

    const avatarForPlayer = await getAvatarForPlayer(
      localStorage.getItem("nickname")!
    );
    let index = 0;
    for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
      const currentRow = [];
      for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
        const slotProps = makeSlotProps(index, row, col);
        currentRow.push(slotProps);
        const imgUrl =
          tmpAvatarsMap[index] == null ? null : tmpAvatarsMap[index].imageUrl;
        const slotStyle = {
          backgroundImage: imgUrl == null ? "none" : `url(${imgUrl})`,
          backgroundColor: roomColorMapping[slotProps.roomType] + "70",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          border:
            index === avatarForPlayer.positionIdx
              ? `5px solid ${avatarForPlayer.strokeColor}`
              : "0px",
        };
        tmpSlotsEnabled[index] = true;
        tmpSlotsClassName[index] = "slot-normal";
        tmpSlotsStyles[index] = slotStyle;
        index++;
      }
      tmpGrid.push(currentRow);
    }

    setGrid(tmpGrid);
    setSlotsEnabled(tmpSlotsEnabled);
    setSlotsClassName(tmpSlotsClassName);
    setSlotsStyles(tmpSlotsStyles);
  };

  useEffect(() => {
    if (gameStarted) {
      init();
    }
  }, [gameStarted]);

  const highlighSlot = (slotIdx: number) => {
    setSlotsEnabled((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = true;
      return oldSlots;
    });
    setSlotsClassName((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = "slot-focus";
      return oldSlots;
    });
  };

  const disableSlot = (slotIdx: number) => {
    setSlotsEnabled((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = false;
      return oldSlots;
    });
    setSlotsClassName((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = "slot-disabled";
      return oldSlots;
    });
  };

  const resetSlot = (slotIdx: number) => {
    setSlotsEnabled((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = true;
      return oldSlots;
    });
    setSlotsClassName((slots) => {
      const oldSlots = { ...slots };
      oldSlots[slotIdx] = "slot-normal";
      return oldSlots;
    });
  };

  const highlightAvailableAvatarSlots = (roomType: string) => {
    const roomPositionsMap = generateRoomToPositionIdx();
    const availableRoomsToPick = getAvailablePickingRooms(roomType);
    for (const [_roomType, _positions] of Object.entries(roomPositionsMap)) {
      for (const positionIdx of _positions) {
        if (availableRoomsToPick.includes(_roomType)) {
          console.log(avatarsIds);

          if (avatarsIds.includes(positionIdx)) {
            // Available for picking - highlight the slot
            highlighSlot(positionIdx);
          } else {
            disableSlot(positionIdx);
          }
        } else {
          disableSlot(positionIdx);
        }
      }
    }
  };

  const onPlayerPick = async (_action: number) => {
    setActionSelected(_action);
    const roomType =
      colorRoomMapping[COLORS[actionToColorStringMapping[_action]]];
    console.log("Player picking assassin! In room " + roomType);
    highlightAvailableAvatarSlots(roomType);
  };

  const onPlayerMove = async (_action: number) => {
    setActionSelected(_action);
    console.log("Player moving! " + _action);
    const avatar = await getAvatarForPlayer(localStorage.getItem("nickname")!);
    const roomType =
      colorRoomMapping[COLORS[actionToColorStringMapping[_action]]];
  };

  return (
    <div key={uuidv4()}>
      <Space direction="vertical" size="large">
        <div>
          {grid.map((row, rowIdx) => {
            return (
              <Row
                key={rowIdx}
                gutter={[1, 1]}
                style={{ justifyContent: "center" }}
              >
                {row.map((col, colIdx) => {
                  return (
                    <Col key={col.index}>{makeSlot(rowIdx * 12 + colIdx)}</Col>
                  );
                })}
              </Row>
            );
          })}
        </div>

        {hasUndo && (
          <Button type="dashed" danger onClick={undo}>
            UNDO
          </Button>
        )}
      </Space>
    </div>
  );
});

export default Room;
