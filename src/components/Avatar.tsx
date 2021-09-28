import React from "react";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Image } from "react-konva";
import { IAvatarProps } from "../interfaces/avatar";
import { clipAvatarPosition, isInWhichRoom } from "../helpers/avatar";
import { roomColorMapping } from "../constants";
import { updateAvatarProps } from "../services/avatar";

export default function Avatar({
  avatarProps,
}: {
  avatarProps: IAvatarProps;
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
  };

  const handleDblClick = (ev: KonvaEventObject<MouseEvent>) => {
    console.log(ev.target.attrs.id);
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
      draggable
      onDblClick={handleDblClick}
      onDragEnd={handleDragEnd}
    ></Image>
  );
}
