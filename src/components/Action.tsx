/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * The action section where the player either throw the dice, or perform action, or watch other player's action status\
 * State Machine: (status)
 * - waiting
 * - choosing
 * - picking
 * - moving
 * - killing
 * - dead
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
  actionToColorMapping,
  actionToColorStringMapping,
} from "../constants";
import { PlaygroundContext } from "../context/PlaygroundContext";
import { getRandomAction } from "../helpers/action";
import IPlaygroundContext from "../interfaces/playground";
import { useListenRoom } from "../services";
import { updatePlayerStatus } from "../services/player";
import { addTurn, deleteRoom, nextTurn } from "../services/room";
import "./Action.css";

export interface IAction {
  clearAction(): void;
}

const Action = forwardRef<IAction, any>(
  ({ onPlayerPick, onPlayerMove, onPlayerKill }, ref): React.ReactElement => {
    const history = useHistory();
    const { playerStats, playersData, gameStarted, gameEnd, winner } =
      useContext<IPlaygroundContext>(PlaygroundContext);

    const { playerTurn } = useListenRoom((turn, capacity) => {});
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
      const _action = getRandomAction();
      setAction(_action);

      if (_action === actions.black) {
        onPlayerKill(_action);
        updatePlayerStatus(localStorage.getItem("nickname")!, "killing").catch(
          (err) => {
            message.error(err);
          }
        );
        addTurn(localStorage.getItem("room_id")!, {
          turn: playerTurn,
          actor: playerStats.nickname,
          status: "killing",
          action: null,
          fromRoom: null,
          toRoom: null,
          avatarID: null,
          killedPlayer: null,
        });
      } else {
        if (playerStats.status === "choosing") {
          onPlayerPick(_action);
          updatePlayerStatus(
            localStorage.getItem("nickname")!,
            "picking"
          ).catch((err) => {
            message.error(err);
          });
          addTurn(localStorage.getItem("room_id")!, {
            turn: playerTurn,
            actor: playerStats.nickname,
            status: "picking",
            action: null,
            fromRoom: null,
            toRoom: null,
            avatarID: null,
            killedPlayer: null,
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
        case "killing":
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                Click someone in your room to murder
              </Typography.Title>
            </div>
          );
        case "moving":
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                Move to any of the highlighted slots
              </Typography.Title>
            </div>
          );
        case "dead":
          return (
            <div>
              <Typography.Title level={typographyLevel}>
                You are dead
              </Typography.Title>
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
