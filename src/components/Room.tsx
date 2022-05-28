import { Button, Row, Col, Space, Spin, message } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
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
  getAllAvatarPositions,
  getAvailableMovingRooms,
  getAvailablePickingRooms,
  getAvatarPositionMap,
  isInWhichRoom,
  makeSlotProps,
} from "../helpers/room";
import { isMobile } from "react-device-detect";
import { updatePlayerStatus } from "../services/player";
import { ISlot } from "../interfaces/room";
import { LoadingOutlined } from "@ant-design/icons";
import { useListenAvatars, useListenPlayer } from "../services";
import { updateAvatarProps } from "../services/avatar";
import { nextTurn } from "../services/room";

export interface IRoomRef {
  onPlayerMove(_action: number): void;
  onPlayerPick(_action: number): void;
  onGameStarted(state: boolean): void;
}

interface IRoomProp {
  onClearAction(): void;
}

const Room = forwardRef<IRoomRef, IRoomProp>(
  ({ onClearAction }, ref): React.ReactElement => {
    const avatars = useListenAvatars();
    const { playerStats, playerAvatar } = useListenPlayer();

    useImperativeHandle(ref, () => ({
      onPlayerMove,
      onPlayerPick,
      onGameStarted,
    }));

    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [grid, setGrid] = useState<ISlot[][]>([]);
    const [slotsEnabled, setSlotsEnabled] = useState<{
      [key: number]: boolean;
    }>({});
    const [slotsClassName, setSlotsClassName] = useState<{
      [key: number]: string;
    }>({});
    const [slotsBorders, setSlotBorders] = useState<{ [key: number]: string }>(
      {}
    );
    const [slotsBackground, setSlotsBackground] = useState<{
      [key: number]: string;
    }>({});
    const [hasUndo, setHasUndo] = useState<boolean>(false);
    const [actionSelected, setActionSelected] = useState<number | null>(null);
    const [pickedSlot, setPickedSlot] = useState<number | null>(null);
    const [rolledRoom, setRolledRoom] = useState<string | null>(null);
    const onGameStarted = (state: boolean) => {
      console.log("Set game started to " + state);

      setGameStarted(state);
    };

    const makeSlot = (slotIdx: number, roomType: string) => (
      <Button
        id={`slot-${slotIdx}`}
        className={slotsClassName[slotIdx] ?? "slot-normal"}
        style={{
          backgroundImage: slotsBackground[slotIdx] ?? "none",
          backgroundColor: roomColorMapping[roomType] + "70",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          border: slotsBorders[slotIdx] ?? "0px",
        }}
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
      if (playerStats && playerStats.status === "picking") {
        setPickedSlot(slotIdx);
        updatePlayerStatus(localStorage.getItem("nickname")!, "moving").catch(
          (err) => {
            message.error(err);
          }
        );
        setHasUndo(true);
        const inRoomType = isInWhichRoom(slotIdx);
        let availableMovingRooms = getAvailableMovingRooms(inRoomType!);
        if (inRoomType !== rolledRoom!) {
          availableMovingRooms = [rolledRoom!];
        }
        for (
          let index = 0;
          index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
          index++
        ) {
          const avatarsPositions = getAllAvatarPositions(avatars);
          if (index !== slotIdx) {
            const roomType = isInWhichRoom(index);
            if (
              availableMovingRooms.includes(roomType!) &&
              !avatarsPositions.includes(index)
            ) {
              highlighSlot(index);
            } else {
              disableSlot(index);
            }
          } else {
            resetSlot(index);
          }
        }
      } else if (playerStats && playerStats.status === "moving") {
        // update avatar image to new selected slot
        // remove image for the old slot
        const avatarPositionMap = getAvatarPositionMap(avatars);
        const selectedAvatar = avatarPositionMap[pickedSlot!];
        setSlotsBackground((slots) => {
          const _slots = { ...slots };
          _slots[slotIdx] = `url(${selectedAvatar.imageUrl})`;
          _slots[pickedSlot!] = "none";
          return _slots;
        });
        setSlotBorders((slots) => {
          const _slots = { ...slots };
          _slots[slotIdx] =
            pickedSlot === playerAvatar?.positionIdx
              ? `5px solid ${playerAvatar!.strokeColor}`
              : "none";
          _slots[pickedSlot!] = "none";
          return _slots;
        });
        // update firebase
        updateAvatarProps(
          localStorage.getItem("room_id")!,
          selectedAvatar!.id,
          slotIdx,
          selectedAvatar!.strokeColor
        );

        // reset all tiles back to normal
        for (
          let index = 0;
          index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
          index++
        ) {
          resetSlot(index);
        }

        // hide undo
        setHasUndo(false);
        setPickedSlot(null);
        setRolledRoom(null);

        // pass the turn
        nextTurn(localStorage.getItem("room_id")!);
        updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
          (err) => {
            message.error(err);
          }
        );
        onClearAction();
      }
    };

    const undo = () => {
      const roomType =
        colorRoomMapping[COLORS[actionToColorStringMapping[actionSelected!]]];
      highlightAvailableAvatarSlots(roomType);
      setPickedSlot(null);
      setHasUndo(false);
      updatePlayerStatus(localStorage.getItem("nickname")!, "picking").catch(
        (err) => {
          message.error(err);
        }
      );
    };

    const clearAllSlots = () => {
      setSlotsBackground(() => {
        const slotsBackground: { [key: number]: string } = {};
        for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
          for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
            const index = row * 12 + col;
            slotsBackground[index] = "none";
          }
        }
        return slotsBackground;
      });
      setSlotBorders(() => {
        const slotsBorder: { [key: number]: string } = {};
        for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
          for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
            const index = row * 12 + col;
            slotsBorder[index] = "none";
          }
        }
        return slotsBorder;
      });
    };

    const init = async () => {
      clearAllSlots();
      const tmpGrid = [];
      const tmpSlotsEnabled: { [key: number]: boolean } = {};
      const tmpSlotsClassName: { [key: number]: string } = {};
      const tmpSlotsBackground: { [key: number]: string } = {};
      const tmpSlotsBorder: { [key: number]: string } = {};
      const avatarPositions = getAllAvatarPositions(avatars);
      const avatarPositionMap = getAvatarPositionMap(avatars);
      let index = 0;
      for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
        const currentRow = [];
        for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
          const slotProps = makeSlotProps(index, row, col);
          currentRow.push(slotProps);
          const imgUrl = !avatarPositions.includes(index)
            ? null
            : avatarPositionMap[index].imageUrl;
          tmpSlotsBackground[index] =
            imgUrl == null ? "none" : `url(${imgUrl})`;
          tmpSlotsBorder[index] =
            index === playerAvatar?.positionIdx
              ? `5px solid ${playerAvatar!.strokeColor}`
              : "0px";
          tmpSlotsEnabled[index] = true;
          tmpSlotsClassName[index] = "slot-normal";
          index++;
        }
        tmpGrid.push(currentRow);
      }

      setGrid(tmpGrid);
      setSlotsEnabled(tmpSlotsEnabled);
      setSlotsClassName(tmpSlotsClassName);
      setSlotsBackground(tmpSlotsBackground);
      setSlotBorders(tmpSlotsBorder);
    };

    useEffect(() => {
      async function asyncInit() {
        setLoading(true);
        await init();
        setLoading(false);
      }
      if (gameStarted) {
        asyncInit();
      }
    }, [gameStarted]);

    useEffect(() => {
      const asyncCallback = async () => {
        if (playerStats && playerStats.status === "choosing") {
          setLoading(true);
          await init();
          setLoading(false);
        }
      };
      asyncCallback();
    }, [playerStats && playerStats.status]);

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
        oldSlots[slotIdx] = false;
        return oldSlots;
      });
      setSlotsClassName((slots) => {
        const oldSlots = { ...slots };
        oldSlots[slotIdx] = "slot-normal";
        return oldSlots;
      });
    };

    const highlightAvailableAvatarSlots = (roomType: string) => {
      const avatarsPositions = getAllAvatarPositions(avatars);
      const roomPositionsMap = generateRoomToPositionIdx();
      const availableRoomsToPick = getAvailablePickingRooms(roomType);
      for (const [_roomType, _positions] of Object.entries(roomPositionsMap)) {
        for (const positionIdx of _positions) {
          if (availableRoomsToPick.includes(_roomType)) {
            if (avatarsPositions.includes(positionIdx)) {
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

    const onPlayerPick = (_action: number) => {
      setActionSelected(_action);
      const roomType =
        colorRoomMapping[COLORS[actionToColorStringMapping[_action]]];
      setRolledRoom(roomType);
      highlightAvailableAvatarSlots(roomType);
    };

    const onPlayerMove = (_action: number) => {
      setActionSelected(_action);
      console.log("Player moving! " + _action);
    };

    return (
      <div>
        <Space direction="vertical" size="large">
          <Spin spinning={loading} indicator={<LoadingOutlined />}>
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
                        <Col key={col.index}>
                          {makeSlot(rowIdx * 12 + colIdx, col.roomType)}
                        </Col>
                      );
                    })}
                  </Row>
                );
              })}
            </div>
          </Spin>
          {hasUndo && (
            <Button type="dashed" danger onClick={undo} disabled={loading}>
              UNDO
            </Button>
          )}
        </Space>
      </div>
    );
  }
);

export default Room;
