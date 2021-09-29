import React, { useState } from "react";
import useImage from "use-image";
import { KonvaEventObject } from "konva/lib/Node";
import { Image } from "react-konva";
import { IAvatarProps } from "../interfaces/avatar";
import { clipAvatarPosition, isInWhichRoom } from "../helpers/avatar";
import { roomColorMapping } from "../constants";
import { updateAvatarProps, updateAvatarStatus } from "../services/avatar";
import { updatePlayerStatus } from "../services/player";
import { message, Modal } from "antd";
import { ThunderboltFilled } from "@ant-design/icons";
import { nextTurn } from "../services/room";

export default function Avatar({
  isKilling,
  isMoving,
  avatarProps,
  onClearAction,
}: {
  isKilling: boolean;
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

    console.log("Set to waiting");

    updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
      (err) => message.error(err)
    );

    console.log("drag end next turn");

    nextTurn(localStorage.getItem("room_id")!);
    onClearAction();
  };

  const handleKillSelect = (ev: KonvaEventObject<MouseEvent>) => {
    if (isKilling) {
      const vid = ev.target.attrs.id;
      Modal.confirm({
        title: "Wanna murder this guy?",
        icon: <ThunderboltFilled />,
        okText: "Let's do this!",
        cancelText: "Never Mind",
        onOk: () => {
          confirmKilling(vid);
        },
      });
    }
  };

  const confirmKilling = async (vid: string) => {
    try {
      console.log("Set to waiting");

      updateAvatarStatus(localStorage.getItem("room_id")!, vid, true);
      updatePlayerStatus(localStorage.getItem("nickname")!, "waiting");
      console.log("after confirm killing next turn");

      await nextTurn(localStorage.getItem("room_id")!);
    } catch (err) {
      console.log(err);
    } finally {
      onClearAction();
    }
  };

  if (!avatarProps.dead)
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
        onClick={handleKillSelect}
        onDragEnd={handleDragEnd}
      ></Image>
    );
  else return <></>;
}
