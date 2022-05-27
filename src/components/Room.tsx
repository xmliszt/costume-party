import { Button, Row, Col } from "antd";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import "./Room.css";
import { roomColorMapping, GRID } from "../constants";
import {
  generateRoomToPositionIdx,
  getAvailableMovingRooms,
  getUnAvailableMovingRooms,
  makeSlotProps,
} from "../helpers/room";
import { isMobile } from "react-device-detect";
import { IAvatarProps } from "../interfaces/avatar";
import { getAllAvatarsProps } from "../services/room";
import { getAvatarForPlayer } from "../services/player";
import { isInWhichRoom } from "../helpers/avatar";

export interface IRoomRef {
  onPlayerMove(): void;
}

const Room = forwardRef<IRoomRef, any>((props, ref): React.ReactElement => {
  useImperativeHandle(ref, () => ({
    onPlayerMove,
  }));

  const [avatars, setAvatars] = useState<IAvatarProps[]>([]);
  // Initialize all avatars
  const makeSlot = (slotId: string, roomType: string) => (
    <Button
      id={slotId}
      className="slot"
      style={{
        backgroundColor: roomColorMapping[roomType] + "70",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }}
      ghost
      size={isMobile ? "small" : "large"}
      icon={<div style={{ width: 0, height: 0 }}></div>}
    ></Button>
  );
  const grid = [];
  let index = 0;
  for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
      currentRow.push(makeSlotProps(index, row, col));
      index++;
    }
    grid.push(currentRow);
  }

  const clearAllSlots = () => {
    for (
      let idx = 0;
      idx < GRID.GRID_CLN_LENGTH * GRID.GRID_ROW_LENGTH;
      idx++
    ) {
      const slot = document.getElementById(`slot-${idx}`);
      if (slot != null) {
        slot!.style.backgroundImage = "";
      }
    }
  };

  const onPlayerMove = async () => {
    console.log("Player moving!");

    const avatar = await getAvatarForPlayer(localStorage.getItem("nickname")!);
    const roomType = isInWhichRoom(avatar.positionIdx)!;
    const availableRoomsToMove = getAvailableMovingRooms(roomType);
    availableRoomsToMove.forEach((roomType) => {
      highlightSlots(roomType);
    });
    const unavailableRooms = getUnAvailableMovingRooms(roomType);
    unavailableRooms.forEach((roomType) => {
      unHighlightSlots(roomType);
    });
  };

  const highlightSlots = async (roomType: string) => {
    const avatars = await getAllAvatarsProps(localStorage.getItem("room_id")!);
    const avatarPositionIdxs: Array<number> = [];
    avatars.forEach((avatar) => {
      avatarPositionIdxs.push(avatar.positionIdx);
    });
    const roomToPositionIdx = generateRoomToPositionIdx();
    const indexes: Array<number> = roomToPositionIdx[roomType];
    indexes.forEach((index) => {
      const slot = document.getElementById(`slot-${index}`);
      if (slot != null && !avatarPositionIdxs.includes(index)) {
        slot!.className = slot!.className.replace("slot", "slot-focus");
      }
    });
  };

  const unHighlightSlots = (roomType: string) => {
    const roomToPositionIdx = generateRoomToPositionIdx();
    const indexes: Array<number> = roomToPositionIdx[roomType];
    indexes.forEach((index) => {
      const slot = document.getElementById(`slot-${index}`);
      if (slot != null) {
        slot!.className = slot!.className.replace("slot-focus", "slot");
      }
    });
  };

  const init = async () => {
    clearAllSlots();
    const avatars = await getAllAvatarsProps(localStorage.getItem("room_id")!);
    setAvatars(avatars);
    avatars.forEach(async (avatar, idx) => {
      const avatarForPlayer = await getAvatarForPlayer(
        localStorage.getItem("nickname")!
      );
      const slot = document.getElementById(`slot-${avatar.positionIdx}`);
      if (slot != null) {
        slot!.style.backgroundImage = `url(${avatar.imageUrl})`;
        if (avatarForPlayer.positionIdx === avatar.positionIdx) {
          slot!.style.border = `5px solid ${avatarForPlayer.strokeColor}`;
        } else {
          slot!.style.border = "0px";
        }
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const gameStarted = localStorage.getItem("gameStarted");
      console.log(`Game started: ${gameStarted}`);

      if (gameStarted === "true") {
        clearInterval(interval);
        init();
      }
    }, 1000);
    init();
  }, []);

  return (
    <div>
      {grid.map((row) => {
        return (
          <Row gutter={[1, 1]} style={{ justifyContent: "center" }}>
            {row.map((col) => {
              return (
                <Col key={col.index}>
                  {makeSlot(`slot-${col.index}`, col.roomType)}
                </Col>
              );
            })}
          </Row>
        );
      })}
    </div>
  );
});

export default Room;
