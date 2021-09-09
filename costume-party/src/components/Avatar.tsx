import React, { useState } from "react";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Image } from "react-konva";
import IAvatarPosition from "../interfaces/avatar";
import { clipAvatarPosition, isInWhichRoom } from "../helpers/avatar";
import { roomColorMapping } from "../constants";

export default function Avatar({
  avatarProps,
}: {
  avatarProps: {
    id: number;
    position: IAvatarPosition;
    imageUrl: string;
    strokeColor: string;
  };
}): React.ReactElement {
  const [image] = useImage(avatarProps.imageUrl);
  const [roomColor, setRoomColor] = useState<string>(avatarProps.strokeColor);

  const handleDragEnd = (ev: KonvaEventObject<DragEvent>) => {
    const x = ev.target.x();
    const y = ev.target.y();

    const roomType = isInWhichRoom({ x, y });
    const clippedPosition = clipAvatarPosition(roomType, { x, y });
    ev.target.x(clippedPosition.x);
    ev.target.y(clippedPosition.y);

    setRoomColor(roomColorMapping[roomType]);
  };

  const handleDblClick = (ev: KonvaEventObject<MouseEvent>) => {
    console.log(ev.target.attrs.id);
  };

  return (
    <Image
      id={`avatar-${avatarProps.id}`}
      x={avatarProps.position.x}
      y={avatarProps.position.y}
      width={40}
      height={40}
      image={image}
      stroke={roomColor}
      strokeWidth={5}
      shadowBlur={10}
      draggable
      onDblClick={handleDblClick}
      onDragEnd={handleDragEnd}
    ></Image>
  );
}
