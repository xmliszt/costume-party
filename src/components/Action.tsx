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
import { Button, message, Typography, Space, Drawer } from "antd";
import {
  useState,
  useContext,
  useImperativeHandle,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { isMobileOnly } from "react-device-detect";
import { useHistory } from "react-router";
import {
  actions,
  actionToColorMapping,
  actionToColorStringMapping,
} from "../constants";
import { PlaygroundContext } from "../context/PlaygroundContext";
import { isMyTurn } from "../controllers/player";
import { getRandomAction } from "../helpers/action";
import { getLastTurnByPlayer } from "../helpers/room";
import { IAvatarProps } from "../interfaces/avatar";
import IPlaygroundContext from "../interfaces/playground";
import { updatePlayerStatus } from "../services/player";
import { addTurn, deleteRoom, nextTurn } from "../services/room";
import "./Action.css";

export interface IAction {
  clearAction(): void;
}

const Action = forwardRef<IAction, any>(
  (
    { onPlayerPick, onPlayerMove, onPlayerKill, conductMurder, undo, hasUndo },
    ref
  ): React.ReactElement => {
    const history = useHistory();
    const {
      turns,
      globals,
      avatars,
      playerStats,
      playersData,
      gameStarted,
      gameEnd,
      winner,
      playerTurn,
      roomCapacity,
    } = useContext<IPlaygroundContext>(PlaygroundContext);

    const { currentTheme } = useThemeSwitcher();
    const [rollActionDrawerVisible, setRollVisible] = useState<boolean>(false);
    const [mobileActionDrawerVisible, setVisible] = useState<boolean>(false);
    const [action, setAction] = useState<number>(actions.null);
    const [availableGlobals, setAvailableGlobals] = useState<IAvatarProps[]>(
      []
    );
    const isEndingShown = useRef(false); // For controlling the end scene modal
    const isDead = useRef(false); // For internal state reference of the state of player

    useEffect(() => {
      if (
        playerStats &&
        isMyTurn(playerStats.order, playerTurn, roomCapacity)
      ) {
        if (playerStats.status === "choosing") {
          setRollVisible(true);
          setVisible(false);
        } else {
          setRollVisible(false);
          setVisible(true);
        }
      } else if (
        playerStats &&
        gameEnd &&
        !(winner === localStorage.getItem("nickname")!)
      ) {
        setVisible(true);
        setRollVisible(false);
      } else {
        setRollVisible(false);
        setVisible(false);
      }
    }, [playerStats, playerTurn, gameEnd, winner]);

    useEffect(() => {
      if (gameEnd) {
        if (!isEndingShown.current) {
          isEndingShown.current = true;
          setTimeout(() => {
            try {
              deleteRoom(localStorage.getItem("room_id")!);
            } catch (e) {
              console.warn("room is already deleted");
            } finally {
              message.warn("Welcome Back!");
              history.push("/");
            }
          }, 10000);
        }
      }
    }, [gameEnd]);

    useEffect(() => {
      if (playerStats && !(playerStats.status === "waiting")) {
        const lastTurnByPlayer = getLastTurnByPlayer(
          turns,
          localStorage.getItem("nickname")!
        );
        if (lastTurnByPlayer && lastTurnByPlayer.action) {
          setAction(lastTurnByPlayer.action);
        }
      }
    });

    useImperativeHandle(ref, () => ({
      clearAction() {
        setAction(actions.null);
      },
    }));

    const typographyLevel = isMobileOnly ? 5 : 1;

    useEffect(() => {
      const availableGlobalAvatars: IAvatarProps[] = [];

      for (const avatar of avatars) {
        if (globals.includes(Number(avatar.id)) && !avatar.dead) {
          availableGlobalAvatars.push(avatar);
        }
      }
      setAvailableGlobals(availableGlobalAvatars);
    }, [avatars, globals]);

    const useGlobal = () => {
      const global = availableGlobals[0];
      conductMurder(global, true);
    };

    const implementAction = (_action: number) => {
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
          action: _action,
          fromRoom: null,
          toRoom: null,
          fromPosition: null,
          toPosition: null,
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
            action: _action,
            fromRoom: null,
            toRoom: null,
            fromPosition: null,
            toPosition: null,
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

    const onChooseAction = () => {
      const _action = getRandomAction();
      setAction(_action);
      implementAction(_action);
    };

    const renderAction = () => {
      if (!gameStarted)
        return (
          <div>
            <Typography>Waiting for players to join...</Typography>
          </div>
        );

      if (gameEnd) {
        if (winner === localStorage.getItem("nickname")!) {
          return (
            <div style={{ textAlign: "center" }}>
              <Typography.Title level={typographyLevel} type="success">
                Congratulations! You Win!
              </Typography.Title>
            </div>
          );
        } else {
          return (
            <div style={{ textAlign: "center" }}>
              <Typography.Title level={typographyLevel}>
                The winner is:{" "}
                <span>
                  <b>{winner}</b>
                </span>
              </Typography.Title>
            </div>
          );
        }
      }

      if (isDead.current) {
        return (
          <div style={{ textAlign: "center" }}>
            <Typography.Title level={typographyLevel} disabled>
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
            <div style={{ textAlign: "center" }}>
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
                  size={isMobileOnly ? "small" : "middle"}
                  style={{ textAlign: "center" }}
                >
                  {isMobileOnly ? (
                    <Typography.Text type="secondary">
                      Roll Your Next Move!
                    </Typography.Text>
                  ) : (
                    <Typography.Title level={3} type="secondary">
                      Roll Your Next Move!
                    </Typography.Title>
                  )}

                  <Button
                    className={isMobileOnly ? "" : "roll"}
                    size={isMobileOnly ? "middle" : "large"}
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
              <div style={{ textAlign: "center" }}>
                <Typography.Title level={typographyLevel} disabled>
                  You are dead
                </Typography.Title>
              </div>
            );
          }

        case "picking":
          return isMobileOnly ? (
            <div style={{ textAlign: "center" }}>
              <div>
                <Typography.Text>
                  You rolled{" "}
                  <span style={{ color: actionToColorMapping[action] }}>
                    {actionToColorStringMapping[action]}
                  </span>
                </Typography.Text>
              </div>

              <Typography.Text>
                Pick a character to start moving!
              </Typography.Text>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <Typography.Title level={typographyLevel}>
                You rolled{" "}
                <span style={{ color: actionToColorMapping[action] }}>
                  {actionToColorStringMapping[action]}
                </span>
              </Typography.Title>
              <Typography.Title level={typographyLevel}>
                Pick a character to start moving!
              </Typography.Title>
            </div>
          );
        case "killing":
          return (
            <div style={{ textAlign: "center" }}>
              {isMobileOnly ? (
                <Typography.Text>
                  Click someone in your room to murder
                </Typography.Text>
              ) : (
                <Typography.Title level={typographyLevel}>
                  Click someone in your room to murder
                </Typography.Title>
              )}

              {availableGlobals.length > 0 ? (
                <div>
                  {isMobileOnly ? (
                    <Typography.Text>
                      Or{" "}
                      <Button
                        danger
                        size={isMobileOnly ? "small" : "large"}
                        onClick={useGlobal}
                      >
                        SKIP
                      </Button>{" "}
                      your turn by allowing an innocent to leave the party!{" "}
                      {"("}
                      {availableGlobals.length}/3{")"}
                    </Typography.Text>
                  ) : (
                    <Typography.Title level={typographyLevel}>
                      Or{" "}
                      <Button
                        danger
                        size={isMobileOnly ? "small" : "large"}
                        onClick={useGlobal}
                      >
                        SKIP
                      </Button>{" "}
                      your turn by allowing an innocent to leave the party!{" "}
                      {"("}
                      {availableGlobals.length}/3{")"}
                    </Typography.Title>
                  )}
                </div>
              ) : isMobileOnly ? (
                <Typography.Text type="warning">
                  All 3 skipping chances have been used! You have to make a
                  kill!
                </Typography.Text>
              ) : (
                <Typography.Title level={typographyLevel} type="warning">
                  All 3 skipping chances have been used! You have to make a
                  kill!
                </Typography.Title>
              )}
            </div>
          );
        case "moving":
          return (
            <div>
              {isMobileOnly ? (
                <Typography.Text>
                  Move to any of the highlighted slots
                </Typography.Text>
              ) : (
                <Typography.Title level={typographyLevel}>
                  Move to any of the highlighted slots
                </Typography.Title>
              )}
            </div>
          );
        case "dead":
          return (
            <div>
              <Typography.Title level={typographyLevel} disabled>
                You are dead
              </Typography.Title>
            </div>
          );
      }
    };

    return (
      <>
        {isMobileOnly ? (
          <></>
        ) : (
          <div className={isMobileOnly ? "action-mobile" : "action"}>
            {renderAction()}
          </div>
        )}
        {isMobileOnly ? (
          <>
            <Drawer
              placement="bottom"
              closable={false}
              height="16%"
              visible={rollActionDrawerVisible}
              key={"bottom-roll"}
              className={
                "roll-drawer" +
                (currentTheme === "light" ? " light-drawer" : " dark-drawer")
              }
            >
              <div className={isMobileOnly ? "action-mobile" : "action"}>
                {renderAction()}
                {hasUndo && (
                  <Button type="dashed" onClick={undo}>
                    UNDO
                  </Button>
                )}
              </div>
              <div className="blurView"></div>
            </Drawer>
            <Drawer
              placement="bottom"
              closable={false}
              height="16%"
              visible={mobileActionDrawerVisible}
              key={"bottom-action"}
              className={
                "action-drawer" +
                (currentTheme === "light" ? " light-drawer" : " dark-drawer")
              }
            >
              <div className={isMobileOnly ? "action-mobile" : "action"}>
                {renderAction()}
                {hasUndo && (
                  <Button type="dashed" onClick={undo}>
                    UNDO
                  </Button>
                )}
              </div>
              <div className="blurView"></div>
            </Drawer>
          </>
        ) : null}
      </>
    );
  }
);

export default Action;
