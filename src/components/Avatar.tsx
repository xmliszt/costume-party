import React from "react";
import useImage from "use-image";
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

  // Handle drag / position / place / kill

  if (!avatarProps.dead) return <div>AVATAR</div>;
  else return <></>;
}
