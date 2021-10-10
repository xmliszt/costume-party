/**
 * The action section where the player either throw the dice, or perform action, or watch other player's action status
 */
import {Button, message, Modal, Typography} from "antd";
import {forwardRef, useContext, useImperativeHandle, useRef, useState,} from "react";
import {useHistory} from "react-router";
import {actions, actionToColorMapping, actionToColorStringMapping, actionToMessageMapping,} from "../constants";
import {PlaygroundContext} from "../context/PlaygroundContext";
import {getRandomAction} from "../helpers/action";
import IPlaygroundContext from "../interfaces/playground";
import {updatePlayerAction} from "../services/player";
import {deleteRoom, nextTurn} from "../services/room";
import "./Action.css";

export interface IAction {
    clearAction(): void;
}

const Action = forwardRef<IAction, any>((props, ref): React.ReactElement => {
  const history = useHistory();
  const {playerStats, playersData, gameStarted, gameEnd, winner} =
        useContext<IPlaygroundContext>(PlaygroundContext);

  const [action, setAction] = useState<number>(actions.NULL);
  const isEndingShown = useRef(false); // For controlling the end scene modal
  const isDead = useRef(false); // For internal state reference of the state of player

  useImperativeHandle(ref, () => ({
    clearAction() {
      setAction(actions.NULL);
    },
  }));

  const onChooseAction = () => {
    const _action = getRandomAction();
    setAction(_action);

    updatePlayerAction(localStorage.getItem("nickname")!, _action).catch(err => message.error(err));
  };

  const renderAction = () => {
    if (!gameStarted)
      return (
        <div>
          <Typography>Waiting for players to join...</Typography>
        </div>
      );

    if (gameEnd) {
      if (!isEndingShown.current) {
        isEndingShown.current = true;
        setTimeout(() => {
          Modal.success({
            title: "Good Game!",
            okText: "Back To Home",
            onOk: () => {
              try {
                deleteRoom(localStorage.getItem("room_id")!);
              } catch (e) {
                console.warn("room is already deleted");
              } finally {
                message.warn("Welcome Back!");
                history.push("/");
              }
            },
          });
        }, 2000);
      }
      if (localStorage.getItem("win")) {
        return (
          <div>
            <Typography.Title level={3}>
                            Congratulations! You Win!
            </Typography.Title>
          </div>
        );
      } else {
        return (
          <div>
            <Typography.Title level={3}>
                            The winner is: {winner}
            </Typography.Title>
          </div>
        );
      }
    }

    if (isDead.current) {
      return (
        <div>
          <Typography.Title level={3}>You are dead</Typography.Title>
        </div>
      );
    }

    switch (playerStats.status) {
    case "waiting": {
      let playingName = "";
      playersData.forEach((player) => {
        if (player.status !== "waiting" && player.alive) {
          playingName = player.nickname;
        }
      });
      return (
        <div>
          <Typography.Title level={3}>
            {playingName} is playing...
          </Typography.Title>
        </div>
      );
    }
    case "choosing":
      if (playerStats.alive) {
        return (
          <div>
            <Typography>
              <span style={{color: "rgba(0,0,0,0.3)"}}>
                  Click the button to play!
              </span>
            </Typography>
            <Button
              size="large"
              type="primary"
              danger
              onClick={onChooseAction}
            >
                                YOUR TURN
            </Button>
          </div>
        );
      } else {
        isDead.current = true;
        nextTurn(localStorage.getItem("room_id")!);
        return (
          <div>
            <Typography.Title level={3}>You are dead</Typography.Title>
          </div>
        );
      }

    case "moving":
    case "killing":
      return (
        <div>
          <Typography.Title level={3}>
                            You chose{" "}
            <span style={{color: actionToColorMapping[action]}}>
              {actionToColorStringMapping[action]}
            </span>
          </Typography.Title>
          <Typography.Paragraph>
            {actionToMessageMapping[action]}
          </Typography.Paragraph>
        </div>
      );
    case "dead":
      return (
        <div>
          <Typography.Title level={3}>You are dead</Typography.Title>
        </div>
      );
    }
  };

  return (
    <>
      <div className="action">{renderAction()}</div>
    </>
  );
});

export default Action;
