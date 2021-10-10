import React from "react";
import useImage from "use-image";
import {KonvaEventObject} from "konva/lib/Node";
import {Image} from "react-konva";
import {IAvatarPosition, IAvatarProps} from "../interfaces/avatar";
import {clipAvatarPosition, isInWhichRoom} from "../helpers/avatar";
import {actions, actionToColorStringMapping, actionToRoomType, roomColorMapping} from "../constants";
import {updateAvatarProps, updateAvatarStatus} from "../services/avatar";
import {updatePlayerStatus} from "../services/player";
import {message, Modal} from "antd";
import {ThunderboltFilled} from "@ant-design/icons";
import {nextTurn} from "../services/room";
import {useListenPlayer} from "../services";
import {areAdjacentRooms} from "../helpers/room";


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

  const [playerStats, _] = useListenPlayer();
  const action = playerStats?.action || actions.NULL;
  const startRoomType = isInWhichRoom(avatarProps.position);

  const handleDragEnd = (ev: KonvaEventObject<DragEvent>) => {
    const endPosition: IAvatarPosition = {
      x: ev.target.x(),
      y: ev.target.y(),
    };
    const endRoomType = isInWhichRoom(endPosition);

    const clippedEndPosition = clipAvatarPosition(endRoomType, endPosition);
    if (action === actions.BLACK || action === actions.NULL) {
      message.error(`Should not be possible for action to be ${action}`);
      ev.target.x(avatarProps.position.x);
      ev.target.y(avatarProps.position.y);
      return;
    }

    // check if moving action is valid
    const actionRoomType = actionToRoomType[action];
    if (actionRoomType !== startRoomType && actionRoomType !== endRoomType) {
      message.warn(`This action is invalid because you rolled ${actionToColorStringMapping[action]}`);
      ev.target.x(avatarProps.position.x);
      ev.target.y(avatarProps.position.y);
      return;
    }

    ev.target.x(clippedEndPosition.x);
    ev.target.y(clippedEndPosition.y);

    updateAvatarProps(
            localStorage.getItem("room_id")!,
            ev.target.attrs.id,
            clippedEndPosition.x,
            clippedEndPosition.y,
            roomColorMapping[endRoomType]
    );

    updatePlayerStatus(localStorage.getItem("nickname")!, "waiting").catch(
      (err) => message.error(err)
    );

    nextTurn(localStorage.getItem("room_id")!);
    onClearAction();

  };

  const handleKillSelect = (ev: KonvaEventObject<MouseEvent>) => {
    if (isKilling) {
      const vid = ev.target.attrs.id;
      Modal.confirm({
        title: "Wanna murder this guy?",
        icon: <ThunderboltFilled/>,
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
      updateAvatarStatus(localStorage.getItem("room_id")!, vid, true);
      updatePlayerStatus(localStorage.getItem("nickname")!, "waiting");
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
      />
    );
  else return <></>;
}
