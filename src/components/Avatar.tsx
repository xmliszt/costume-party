import React from "react";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Image } from "react-konva";
import { IAvatarProps } from "../interfaces/avatar";
import { clipAvatarPosition, isInWhichRoom } from "../helpers/avatar";
import { roomColorMapping } from "../constants";
import { updateAvatarProps } from "../services/avatar";
import { updatePlayerStatus } from "../services/player";
import { message } from "antd";
import { nextTurn } from "../services/room";

export default function Avatar({
  isMoving,
  avatarProps,
  onClearAction,
}: {
  isMoving: boolean;
  avatarProps: IAvatarProps;
  onClearAction: CallableFunction;
}): React.ReactElement {
  const [image] = useImage(avatarProps.imageUrl);
  const handleDragEnd = (ev: KonvaEventObject<DragEvent>) => {
    const x = ev.target.x();
    const y = ev.target.y();

    const roomType = isInWhichRoom({ x, y });
    const clippedPosition = clipAvatarPosition(roomType, { x, y });
    ev.target.x(clippedPosition.x);
    ev.target.y(clippedPosition.y);

    updateAvatarProps(
      localStorage.getItem("room_id")!,
      ev.target.attrs.id,
      clippedPosition.x,
      clippedPosition.y,
      roomColorMapping[roomType]
    );

    updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
      (err) => message.error(err)
    );

    nextTurn(localStorage.getItem("room_id")!);
    onClearAction();
  };

  const handleDblClick = (ev: KonvaEventObject<MouseEvent>) => {
    console.log(ev.target.attrs.id);
    updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
      (err) => message.error(err)
    );
    nextTurn(localStorage.getItem("room_id")!);
    onClearAction();
  };

  return (
    <Image
      id={avatarProps.id}
      x={avatarProps.position.x}
      y={avatarProps.position.y}
      width={40}
      height={40}
      image={image}
      stroke={avatarProps.strokeColor}
      strokeWidth={5}
      shadowBlur={10}
      draggable={isMoving}
      onDblClick={handleDblClick}
      onDragEnd={handleDragEnd}
    ></Image>
  );
}
