/* eslint-disable @typescript-eslint/no-empty-function */
import { Button, Row, Col, Space, Spin, message, Modal } from "antd";
import React, {
  forwardRef,
  useContext,
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
  getAvailableMovingRooms,
  getAvailablePickingRooms,
  getLastKillTurn,
  getLastMovingTurn,
  getLastTurnByPlayer,
  isInWhichRoom,
  makeSlotProps,
} from "../helpers/room";
import { isMobile } from "react-device-detect";
import { getPlayerByAvatarID, updatePlayerStatus } from "../services/player";
import { ISlot } from "../interfaces/room";
import { LoadingOutlined } from "@ant-design/icons";
import { updateAvatarProps, updateAvatarStatus } from "../services/avatar";
import { addTurn, getPlayerAvatars, nextTurn } from "../services/room";
import {
  getAllAvatarPositions,
  getAvatarPositionMap,
  getPlayerAvatar,
} from "../helpers/avatar";
import Avatar from "antd/lib/avatar/avatar";
import { IAvatarProps } from "../interfaces/avatar";
import { PlaygroundContext } from "../context/PlaygroundContext";
import IPlaygroundContext from "../interfaces/playground";
import LineTo from "react-lineto";

export interface IRoomRef {
  onPlayerMove(_action: number): void;
  onPlayerPick(_action: number): void;
  onPlayerKill(_action: number): void;
  conductMurder(avatarToKill: IAvatarProps, isSkip: boolean): Promise<void>;
}
interface IRoomProp {
  onClearAction(): void;
}

const Room = forwardRef<IRoomRef, IRoomProp>(
  ({ onClearAction }, ref): React.ReactElement => {
    const { avatars, playerStats, gameStarted, playerTurn, turns } =
      useContext<IPlaygroundContext>(PlaygroundContext);

    useImperativeHandle(ref, () => ({
      onPlayerMove,
      onPlayerPick,
      onPlayerKill,
      conductMurder,
    }));

    const [loading, setLoading] = useState<boolean>(false);
    const [grid, setGrid] = useState<ISlot[][]>([]);
    const [slotsEnabled, setSlotsEnabled] = useState<{
      [key: number]: boolean;
    }>({});
    const [slotsClassName, setSlotsClassName] = useState<{
      [key: number]: string;
    }>({});
    const [hasUndo, setHasUndo] = useState<boolean>(false);
    const [actionSelected, setActionSelected] = useState<number | null>(null);
    const [pickedSlot, setPickedSlot] = useState<number | null>(null);
    const [rolledRoom, setRolledRoom] = useState<string | null>(null);
    const [playerAvatar, setPlayerAvatar] = useState<IAvatarProps | null>(null);

    useEffect(() => {
      const avatar = getPlayerAvatar(avatars, playerStats);
      setPlayerAvatar(avatar);
    }, [avatars]);

    const restoreStatus = () => {
      if (playerStats && !(playerStats.status === "waiting")) {
        const lastTurnByPlayer = getLastTurnByPlayer(
          turns,
          localStorage.getItem("nickname")!
        );
        if (lastTurnByPlayer) {
          setActionSelected(lastTurnByPlayer.action);
          switch (lastTurnByPlayer.status) {
            case "picking": {
              onPlayerPick(lastTurnByPlayer.action!);
              break;
            }
            case "moving": {
              onPlayerMove(lastTurnByPlayer.action!);
              break;
            }
            case "killing": {
              onPlayerKill(lastTurnByPlayer.action!);
              break;
            }
          }
          updatePlayerStatus(
            localStorage.getItem("nickname")!,
            lastTurnByPlayer.status
          ).catch((err) => {
            message.error(err);
          });
        }
      }
    };

    const renderTurnLine = () => {
      return (
        <LineTo
          from="from-slot"
          to="to-slot"
          borderColor="#00000040"
          borderWidth={5}
          borderStyle="dotted"
          zIndex={999}
        ></LineTo>
      );
    };

    const makeSlot = (slotIdx: number, roomType: string) => {
      let isToAvatar = false;
      let isFromAvatar = false;
      let isLastKilledSlot = false;
      let isAvatarSlot = false;

      const avatarPositions = getAllAvatarPositions(avatars);
      if (avatarPositions.includes(slotIdx)) {
        isAvatarSlot = true;
      }
      const avatarPositionMap = getAvatarPositionMap(avatars);
      const backgroundImage = avatarPositions.includes(slotIdx)
        ? !avatarPositionMap[slotIdx].dead
          ? avatarPositionMap[slotIdx].imageUrl
          : "none"
        : "none";

      const lastMovingTurn = getLastMovingTurn(turns);
      const lastKillTurn = getLastKillTurn(turns);

      if (lastMovingTurn) {
        if (lastMovingTurn.toPosition === slotIdx) {
          isToAvatar = true;
        } else if (lastMovingTurn.fromPosition === slotIdx) {
          isFromAvatar = true;
        }
      }

      if (lastKillTurn) {
        if (lastKillTurn.fromPosition === slotIdx) {
          isLastKilledSlot = true;
        }
      }

      return (
        <Button
          id={`slot-${slotIdx}`}
          className={
            (slotsClassName[slotIdx] ?? "slot-normal") +
            (isFromAvatar ? " from-slot" : "") +
            (isToAvatar ? " to-slot" : "")
          }
          style={{
            backgroundImage:
              isLastKilledSlot && !isAvatarSlot
                ? `url(${process.env.PUBLIC_URL}/dead.png)`
                : `url(${backgroundImage})`,
            backgroundColor: roomColorMapping[roomType] + "70",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            border:
              playerAvatar?.positionIdx === slotIdx
                ? `5px solid ${playerAvatar!.strokeColor}`
                : "none",
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
    };

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
        const fromPosition = selectedAvatar.positionIdx;
        const toPosition = slotIdx;
        const fromWhichRoom = isInWhichRoom(fromPosition);
        const inWhichRoom = isInWhichRoom(toPosition);
        // update firebase
        updateAvatarProps(
          localStorage.getItem("room_id")!,
          selectedAvatar!.id,
          slotIdx,
          roomColorMapping[inWhichRoom!]
        ).then(() => {
          addTurn(localStorage.getItem("room_id")!, {
            turn: playerTurn,
            actor: playerStats.nickname,
            status: "moving",
            action: actionSelected,
            fromRoom: fromWhichRoom,
            fromPosition: fromPosition,
            toRoom: inWhichRoom,
            toPosition: toPosition,
            avatarID: Number(selectedAvatar.id),
            killedPlayer: null,
          });

          // pass the turn
          nextTurn(localStorage.getItem("room_id")!);
          updatePlayerStatus(
            localStorage.getItem("nickname")!,
            "waiting"
          ).catch((err) => {
            message.error(err);
          });
          onClearAction();
        });

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
      } else if (playerStats && playerStats.status === "killing") {
        const avatarPositionMap = getAvatarPositionMap(avatars);
        const killedAvatar = avatarPositionMap[slotIdx];

        // Confirmation
        Modal.confirm({
          title: "Wanna murder this guy?",
          icon: (
            <Avatar
              className="drop-shadow"
              size={50}
              src={killedAvatar.imageUrl}
            />
          ),
          okText: "Let's do this!",
          cancelText: "Never Mind",
          onOk: () => {
            conductMurder(killedAvatar, false);
          },
        });
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

    const refresh = async () => {
      for (
        let index = 0;
        index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
        index++
      ) {
        resetSlot(index);
      }
    };

    const init = async () => {
      const tmpGrid = [];
      const tmpSlotsEnabled: { [key: number]: boolean } = {};
      const tmpSlotsClassName: { [key: number]: string } = {};
      let index = 0;
      for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
        const currentRow = [];
        for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
          const slotProps = makeSlotProps(index, row, col);
          currentRow.push(slotProps);
          tmpSlotsEnabled[index] = false;
          tmpSlotsClassName[index] = "slot-normal";
          index++;
        }
        tmpGrid.push(currentRow);
      }

      setGrid(tmpGrid);
      setSlotsEnabled(tmpSlotsEnabled);
      setSlotsClassName(tmpSlotsClassName);
    };

    useEffect(() => {
      async function asyncInit() {
        setLoading(true);
        await init();
        restoreStatus();
        setLoading(false);
      }
      if (gameStarted) {
        asyncInit();
      }
    }, [gameStarted]);

    useEffect(() => {
      const asyncCallback = async () => {
        setLoading(true);
        await refresh();
        setLoading(false);
      };
      asyncCallback();
    }, [playerTurn]);

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

    const conductMurder = async (
      avatarToKill: IAvatarProps,
      isSkip: boolean
    ) => {
      // Kill the chosen target
      updateAvatarStatus(
        localStorage.getItem("room_id")!,
        avatarToKill.id,
        true
      ).then(() => {
        addTurn(localStorage.getItem("room_id")!, {
          turn: playerTurn,
          actor: playerStats?.nickname ?? "",
          status: isSkip ? "skip" : "kill",
          action: actionSelected,
          fromRoom: isInWhichRoom(avatarToKill.positionIdx),
          toRoom: null,
          fromPosition: avatarToKill.positionIdx,
          toPosition: null,
          avatarID: Number(avatarToKill.id),
          killedPlayer: null,
        });
      });

      getPlayerAvatars(localStorage.getItem("room_id")!).then(
        (playerAvatars) => {
          if (playerAvatars.includes(Number(avatarToKill.id))) {
            getPlayerByAvatarID(Number(avatarToKill.id))
              .then((player) => {
                addTurn(localStorage.getItem("room_id")!, {
                  turn: playerTurn,
                  actor: player.nickname,
                  status: "dead",
                  action: null,
                  fromRoom: null,
                  toRoom: null,
                  fromPosition: null,
                  toPosition: null,
                  avatarID: null,
                  killedPlayer: null,
                });
              })
              .catch((err) => {
                message.error(err);
              });
          }
        }
      );

      // Reset the board
      setPickedSlot(null);
      setRolledRoom(null);
      setHasUndo(false);

      // reset all tiles back to normal
      for (
        let index = 0;
        index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
        index++
      ) {
        resetSlot(index);
      }

      // pass the turn
      nextTurn(localStorage.getItem("room_id")!);
      updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
        (err) => {
          message.error(err);
        }
      );
      onClearAction();
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
    };

    const onPlayerKill = (_action: number) => {
      setActionSelected(_action);
      // disable everything first
      for (
        let index = 0;
        index < GRID.GRID_ROW_LENGTH * GRID.GRID_CLN_LENGTH;
        index++
      ) {
        disableSlot(index);
      }
      // highlight available avatars only in current player's avatar's room
      if (playerAvatar) {
        const avatarPositions = getAllAvatarPositions(avatars);
        const playerInRoom = isInWhichRoom(playerAvatar.positionIdx);
        let count = 0;
        for (const avatarIdx of avatarPositions) {
          const room = isInWhichRoom(avatarIdx);

          if (room === playerInRoom && avatarIdx !== playerAvatar.positionIdx) {
            highlighSlot(avatarIdx);
            count++;
          } else if (avatarIdx === playerAvatar.positionIdx) {
            resetSlot(avatarIdx);
          }
        }

        // Suicide case
        if (count === 0) {
          // self kill
          conductMurder(playerAvatar, false);
        }
      }
    };

    return (
      <div className="room">
        {renderTurnLine()}
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
