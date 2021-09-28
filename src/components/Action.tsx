/**
 * The action section where the player either throw the dice, or perform action, or watch other player's action status
 */
import { Button, message, Typography } from "antd";
import { useState, useContext, useImperativeHandle, forwardRef } from "react";
import {
  actions,
  actionToMessageMapping,
  actionToColorMapping,
  actionToColorStringMapping,
} from "../constants";
import { PlaygroundContext } from "../context/PlaygroundContext";
import { isMyTurn } from "../controllers/player";
import { getRandomAction } from "../helpers/action";
import IPlaygroundContext from "../interfaces/playground";
import { updatePlayerStatus } from "../services/player";
import "./Action.css";

export interface IAction {
  clearAction(): void;
}

const Action = forwardRef<IAction, any>((props, ref): React.ReactElement => {
  const { playerStats, playerTurn, roomCapacity, gameStarted } =
    useContext<IPlaygroundContext>(PlaygroundContext);

  const [action, setAction] = useState<number>(actions.NULL);

  useImperativeHandle(ref, () => ({
    clearAction() {
      setAction(actions.NULL);
    },
  }));

  const onChooseAction = () => {
    const _action = getRandomAction();
    setAction(_action);

    if (_action === actions.BLACK) {
      updatePlayerStatus(localStorage.getItem("nickname")!, "killing").catch(
        (err) => {
          message.error(err);
        }
      );
    } else {
      updatePlayerStatus(localStorage.getItem("nickname")!, "moving").catch(
        (err) => {
          message.error(err);
        }
      );
    }
  };

  const renderAction = () => {
    if (!gameStarted)
      return (
        <div>
          <Typography>Waiting for players to join...</Typography>
        </div>
      );
    if (isMyTurn(playerStats?.order, playerTurn, roomCapacity)) {
      if (action === actions.NULL) {
        return (
          <div>
            <Typography>
              <span style={{ color: "rgba(0,0,0,0.3)" }}>
                Click the button to play!
              </span>
            </Typography>
            <Button size="large" type="primary" danger onClick={onChooseAction}>
              YOUR TURN
            </Button>
          </div>
        );
      } else {
        return (
          <div>
            <Typography.Title level={3}>
              You chose{" "}
              <span style={{ color: actionToColorMapping[action] }}>
                {actionToColorStringMapping[action]}
              </span>
            </Typography.Title>
            <Typography.Paragraph>
              {actionToMessageMapping[action]}
            </Typography.Paragraph>
          </div>
        );
      }
    } else {
      return (
        <div>
          <Typography>Other player is playing...</Typography>
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
