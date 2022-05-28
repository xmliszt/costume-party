/**
 * The action section where the player either throw the dice, or perform action, or watch other player's action status
 */
import { Button, message, Modal, Typography, Space } from "antd";
import {
  useState,
  useContext,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
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
import { deleteRoom, nextTurn } from "../services/room";
import "./Action.css";

export interface IAction {
  clearAction(): void;
}

const Action = forwardRef<IAction, any>(
  ({ onPlayerPick, onPlayerMove }, ref): React.ReactElement => {
    const history = useHistory();
    const { playerStats, playersData, gameStarted, gameEnd, winner } =
      useContext<IPlaygroundContext>(PlaygroundContext);

    const [action, setAction] = useState<number>(actions.null);

    const isEndingShown = useRef(false); // For controlling the end scene modal
    const isDead = useRef(false); // For internal state reference of the state of player

    useImperativeHandle(ref, () => ({
      clearAction() {
        setAction(actions.null);
      },
    }));

    const typographyLevel = isMobile ? 5 : 3;

    const onChooseAction = () => {
      console.log(
        "Player choosing action... Current status of player: " +
          playerStats.status
      );

      const _action = getRandomAction();
      setAction(_action);

      if (_action === actions.black) {
        updatePlayerStatus(localStorage.getItem("nickname")!, "killing").catch(
          (err) => {
            message.error(err);
          }
        );
      } else {
        if (playerStats.status === "choosing") {
          onPlayerPick(_action);
          updatePlayerStatus(
            localStorage.getItem("nickname")!,
            "picking"
          ).catch((err) => {
            message.error(err);
          });
        } else {
          onPlayerMove(_action);
          updatePlayerStatus(localStorage.getItem("nickname")!, "moving").catch(
            (err) => {
              message.error(err);
            }
          );
        }
      }
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
              <Typography.Title level={typographyLevel}>
                Congratulations! You Win!
              </Typography.Title>
            </div>
          );
        } else {
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                The winner is: {winner}
              </Typography.Title>
            </div>
          );
        }
      }

      if (isDead.current) {
        return (
          <div>
            <Typography.Title level={typographyLevel}>
              You are dead
            </Typography.Title>
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
              <Typography.Title level={typographyLevel}>
                {playingName} is playing...
              </Typography.Title>
            </div>
          );
        }
        case "choosing":
          if (playerStats.alive) {
            return (
              <div>
                <Space
                  direction="vertical"
                  size={isMobile ? "small" : "middle"}
                  style={{ display: "flex" }}
                >
                  <Typography.Text type="secondary">
                    Roll Your Next Move!
                  </Typography.Text>
                  <Button
                    size={isMobile ? "middle" : "large"}
                    type="primary"
                    onClick={onChooseAction}
                  >
                    ROLL
                  </Button>
                </Space>
              </div>
            );
          } else {
            isDead.current = true;
            nextTurn(localStorage.getItem("room_id")!);
            return (
              <div>
                <Typography.Title level={typographyLevel}>
                  You are dead
                </Typography.Title>
              </div>
            );
          }

        case "picking":
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                You rolled{" "}
                <span style={{ color: actionToColorMapping[action] }}>
                  {actionToColorStringMapping[action]}
                </span>
              </Typography.Title>
              <Typography.Paragraph>
                Pick an assassin to start moving!
              </Typography.Paragraph>
            </div>
          );

        case "moving":
        case "killing":
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                You rolled{" "}
                <span style={{ color: actionToColorMapping[action] }}>
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
        <div className={isMobile ? "action-mobile" : "action"}>
          {renderAction()}
        </div>
      </>
    );
  }
);

export default Action;
