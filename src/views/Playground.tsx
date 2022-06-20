/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import {
  Typography,
  message,
  Spin,
  Timeline,
  Avatar,
  Drawer,
  notification,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./Playground.css";

import Room, { IRoomRef } from "../components/Room";
import Persona from "../components/Persona";
import Action, { IAction } from "../components/Action";
import PlayerStatus from "../components/PlayerStatus";

import { PlaygroundContext } from "../context/PlaygroundContext";
import { isMyTurn } from "../controllers/player";
import {
  useListenAvatars,
  useListenPlayer,
  useListenPlayers,
  useListenRoom,
  useListenTurns,
} from "../services";
import { getPlayerByNickname, updatePlayerStatus } from "../services/player";
import { getRoomStates, onNextTurn } from "../services/room";
import { isMobileOnly } from "react-device-detect";
import { ITurn } from "../interfaces/room";
import {
  actionToColorMapping,
  actionToColorStringMapping,
  roomColorMapping,
  roomColorNameMapping,
} from "../constants";
import Text from "antd/lib/typography/Text";
import { useThemeSwitcher } from "react-css-theme-switcher";
import _ from "lodash";
import { getLastKillTurn } from "../helpers/room";

interface IPlaygroundProps {
  changeLocation(location: string): void;
  isMuted: boolean;
}

export default function Playground({
  changeLocation,
  isMuted,
}: IPlaygroundProps): React.ReactElement {
  const actionRef = useRef<IAction>(null);
  const roomRef = useRef<IRoomRef>(null);

  const history = useHistory();
  const { currentTheme } = useThemeSwitcher();

  const avatars = useListenAvatars();
  const { playerStats } = useListenPlayer();
  const playersData = useListenPlayers();
  const turns = useListenTurns();

  const [notifiedLastKill, setNotifiedLastKill] = useState<ITurn>();
  const [notifiedLastTurn, setNotifiedLastTurn] = useState<ITurn>();
  const [muted, setMuted] = useState<boolean>(true);
  const [isMobileTimelineShown, setMobileTimelineVisible] =
    useState<boolean>(false);

  useEffect(() => {
    setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    changeLocation("play");
  });

  const {
    globals,
    playerCount,
    playersAvatars,
    roomCapacity,
    gameStarted,
    playerTurn,
    gameEnd,
    winner,
  } = useListenRoom(onNextTurn);

  const init = async () => {
    const roomID = localStorage.getItem("room_id");
    const nickname = localStorage.getItem("nickname");

    if (!roomID || !nickname) {
      message.error("no room joined!");
      history.push("/");
    } else {
      const player = await getPlayerByNickname(nickname);
      const room = await getRoomStates(roomID);
      if (isMyTurn(player.order, room.turn, room.capacity) && player.alive) {
        if (player.status === "waiting") {
          updatePlayerStatus(nickname, "choosing").catch((err) => {
            console.error(err);
          });
        }
      }
    }
  };

  useEffect(() => {
    notification.config({
      duration: 5,
      maxCount: 1,
    });
  }, []);

  useEffect(() => {
    const lastTurn = turns[turns.length - 1];
    const lastKillTurn = getLastKillTurn(turns);
    console.log(notifiedLastTurn, lastTurn);

    if (
      lastTurn &&
      playerStats &&
      !_.isEqual(notifiedLastTurn, lastTurn) &&
      lastTurn.actor != localStorage.getItem("nickname")!
    ) {
      const msg = generateTurnMessage(lastTurn);
      if (msg) {
        notification.open({
          message: <></>,
          description: (
            <span>
              {msg.message && msg.message}
              {msg.pendingMessage && ` ${msg.pendingMessage}`}
            </span>
          ),
          placement: "top",
        });
        setNotifiedLastTurn(lastTurn);
      }
    }

    if (
      lastKillTurn &&
      lastKillTurn.turn == playerTurn - 1 &&
      !_.isEqual(notifiedLastKill, lastKillTurn) &&
      lastTurn.actor == localStorage.getItem("nickname")!
    ) {
      const msg = generateTurnMessage(lastKillTurn);
      if (msg) {
        notification.warning({
          message: <Typography.Text>Assassin is on the move!</Typography.Text>,
          description: <span>{msg.message}</span>,
          placement: "top",
        });
        setNotifiedLastKill(lastKillTurn);
      }
    }
  }, [turns]);

  useEffect(() => {
    init();
  }, []);

  const onClearAction = (): void => {
    actionRef?.current?.clearAction();
  };

  const renderStats = () => {
    if (isMobileOnly) {
      return (
        <div
          className={
            currentTheme === "light" ? "stats-mobile" : "stats-mobile-dark"
          }
        >
          <Persona />
        </div>
      );
    } else {
      return (
        <div className={currentTheme === "light" ? "stats" : "stats-dark"}>
          <Persona />
          <PlayerStatus />
        </div>
      );
    }
  };

  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  interface ITurnMessage {
    subject: string;
    message: React.ReactElement | null;
    pending: boolean; // if true, will display as pending in timeline, otherwise, display as a step
    pendingMessage: string | null;
  }

  const generateTurnMessage = (turn: ITurn): ITurnMessage | null => {
    switch (turn.status) {
      case "choosing":
        return {
          subject: turn.actor,
          message: null,
          pending: true,
          pendingMessage: `${turn.actor} is choosing a room by rolling dice...`,
        };
      case "picking":
        return {
          subject: turn.actor,
          message: (
            <span>
              <span>
                <b>{turn.actor}</b>
              </span>
              <span> has rolled </span>
              <b style={{ color: actionToColorMapping[turn.action!] }}>
                {actionToColorStringMapping[turn.action!].toUpperCase()}.
              </b>
            </span>
          ),
          pending: true,
          pendingMessage: `${turn.actor} is picking an avatar to move...`,
        };
      case "moving": {
        return {
          subject: turn.actor,
          message: (
            <span>
              <span>
                <b>{turn.actor}</b>
              </span>
              <span> moved </span>
              <Avatar
                src={`${process.env.PUBLIC_URL}/avatars/${turn.avatarID}.png`}
                size="small"
              ></Avatar>
              <span> from </span>
              <span style={{ color: roomColorMapping[turn.fromRoom!] }}>
                {roomColorNameMapping[turn.fromRoom!]} Room
              </span>
              <span> to </span>
              <span style={{ color: roomColorMapping[turn.toRoom!] }}>
                {roomColorNameMapping[turn.toRoom!]} Room
              </span>
            </span>
          ),
          pending: false,
          pendingMessage: null,
        };
      }
      case "killing": {
        return {
          subject: turn.actor,
          message: null,
          pending: true,
          pendingMessage: `${turn.actor} is choosing an avatar to kill...`,
        };
      }
      case "kill": {
        return {
          subject: turn.actor,
          message: (
            <span>
              <span>
                <b>{turn.actor}</b>
              </span>
              <span>
                <b style={{ color: "#F56C6C" }}> killed</b>
              </span>
              <Avatar
                src={`${process.env.PUBLIC_URL}/avatars/${turn.avatarID}.png`}
                size="small"
              ></Avatar>
              <span> in </span>
              <span style={{ color: roomColorMapping[turn.fromRoom!] }}>
                {roomColorNameMapping[turn.fromRoom!]} Room
              </span>
              <span>
                ,{" "}
                {playersAvatars.includes(turn.avatarID!)
                  ? `who is an assassin!`
                  : "who is an innocent!"}
              </span>
            </span>
          ),
          pending: false,
          pendingMessage: null,
        };
      }
      case "skip": {
        return {
          subject: turn.actor,
          message: (
            <span>
              <Avatar
                src={`${process.env.PUBLIC_URL}/avatars/${turn.avatarID}.png`}
                size="small"
              ></Avatar>
              <span> in </span>
              <span style={{ color: roomColorMapping[turn.fromRoom!] }}>
                {roomColorNameMapping[turn.fromRoom!]} Room
              </span>
              <span> is killed by mysterious forces</span>
            </span>
          ),
          pending: false,
          pendingMessage: null,
        };
      }
      case "dead": {
        return {
          subject: turn.actor,
          message: <Text disabled>{turn.actor} is dead...</Text>,
          pending: false,
          pendingMessage: null,
        };
      }
      default:
        return null;
    }
  };

  function renderTimelineItems() {
    const msgs: ITurnMessage[] = [];
    turns.forEach((turn) => {
      const msg = generateTurnMessage(turn);
      if (msg && !msg.pending) {
        msg && msgs.push(msg);
      } else if (msg && msg.pending && msg.message) {
        msgs.push(msg);
      }
    });
    return msgs;
  }

  useEffect(() => {
    turns.forEach((turn) => {
      const msg = generateTurnMessage(turn);
      if (msg && msg.pending) {
        setPendingMsg(msg.pendingMessage);
      }
    });
  }, [turns]);

  return (
    <PlaygroundContext.Provider
      value={{
        globals,
        avatars,
        playersData,
        playerStats,
        playerCount,
        roomCapacity,
        playerTurn,
        gameStarted,
        gameEnd,
        winner,
        turns,
      }}
    >
      <div className="playground">
        {isMobileOnly && (
          <div
            className={
              "mobile-side-panel-wrapper" +
              (currentTheme === "light" ? " dark-bg" : " light-bg")
            }
            onClick={() => {
              setMobileTimelineVisible(true);
            }}
          >
            HISTORY - TIMELINE
          </div>
        )}
        {!gameStarted && (
          <div className="title">
            <Typography.Title level={1} code copyable>
              {localStorage.getItem("room_id")}
            </Typography.Title>
            <Typography.Text disabled>
              Copy to share the Party ID with friends!
            </Typography.Text>
          </div>
        )}
        <Spin
          spinning={!gameStarted}
          indicator={<LoadingOutlined />}
          tip={`Loading The Party... ${playerCount}/${roomCapacity}`}
        >
          <div className={isMobileOnly ? "main-board-mobile" : "main-board"}>
            {renderStats()}
            <Room ref={roomRef} onClearAction={onClearAction} muted={muted} />
            {!isMobileOnly && (
              <div
                className={
                  "timeline" +
                  (currentTheme === "light" ? " light-bg" : " dark-bg")
                }
              >
                <div
                  className={
                    "gradient-overlay" +
                    (currentTheme === "light"
                      ? " light-gradient"
                      : " dark-gradient")
                  }
                ></div>
                <div className={"scrollable"}>
                  <Timeline mode="left" pending={pendingMsg} reverse>
                    {renderTimelineItems().map((message, idx) => (
                      <Timeline.Item key={idx}>{message.message}</Timeline.Item>
                    ))}
                  </Timeline>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Action
              ref={actionRef}
              onPlayerMove={roomRef.current?.onPlayerMove}
              onPlayerPick={roomRef.current?.onPlayerPick}
              onPlayerKill={roomRef.current?.onPlayerKill}
              conductMurder={roomRef.current?.conductMurder}
              undo={roomRef.current?.undo}
              hasUndo={roomRef.current?.hasUndo}
            />
          </div>
        </Spin>
        {isMobileOnly && (
          <Drawer
            className={
              (currentTheme === "light" ? " light-bg" : " dark-bg") +
              " mobile-timeline"
            }
            title="HISTORY - TIMELINE"
            placement="right"
            width={"80vw"}
            visible={isMobileTimelineShown}
            onClose={() => {
              setMobileTimelineVisible(false);
            }}
          >
            <Timeline mode="left" pending={pendingMsg} reverse>
              {renderTimelineItems().map((message, idx) => (
                <Timeline.Item key={idx}>{message.message}</Timeline.Item>
              ))}
            </Timeline>
          </Drawer>
        )}
      </div>
    </PlaygroundContext.Provider>
  );
}
