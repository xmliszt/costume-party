/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Typography, message, Spin, Divider, Timeline, Avatar } from "antd";
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
import { isMobile } from "react-device-detect";
import { ITurn } from "../interfaces/room";
import { roomColorMapping, roomColorNameMapping } from "../constants";
import Text from "antd/lib/typography/Text";

export default function Playground(): React.ReactElement {
  const actionRef = useRef<IAction>(null);
  const roomRef = useRef<IRoomRef>(null);

  const history = useHistory();

  const avatars = useListenAvatars();
  const { playerStats } = useListenPlayer();
  const playersData = useListenPlayers();
  const turns = useListenTurns();

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
    const asyncInit = async () => {
      await init();
    };
    asyncInit();
  }, []);

  const onClearAction = (): void => {
    actionRef?.current?.clearAction();
  };

  const renderStats = () => {
    if (isMobile) {
      return (
        <section className="stats-mobile">
          <Action
            ref={actionRef}
            onPlayerMove={roomRef.current?.onPlayerMove}
            onPlayerPick={roomRef.current?.onPlayerPick}
            onPlayerKill={roomRef.current?.onPlayerKill}
            conductMurder={roomRef.current?.conductMurder}
          />
          <Divider></Divider>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Persona />
            <PlayerStatus />
          </div>
        </section>
      );
    } else {
      return (
        <section className="stats">
          <Persona />
          <div style={{ display: "flex" }}>
            <Divider style={{ height: 200 }} type="vertical" />
            <Action
              ref={actionRef}
              onPlayerMove={roomRef.current?.onPlayerMove}
              onPlayerPick={roomRef.current?.onPlayerPick}
              onPlayerKill={roomRef.current?.onPlayerKill}
              conductMurder={roomRef.current?.conductMurder}
            />
            <Divider style={{ height: 200 }} type="vertical" />
          </div>
          <PlayerStatus />
        </section>
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
          message: null,
          pending: true,
          pendingMessage: `${turn.actor} is picking an avatar to move...`,
        };
      case "moving": {
        return {
          subject: turn.actor,
          message: (
            <span>
              <span>{turn.actor} moved </span>
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
                {turn.actor} <b style={{ color: "#F56C6C" }}>killed</b>
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
                  ? `who is an assassin!!!`
                  : "who is an innocent :("}
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
      <div className="title">
        <Typography.Title level={1} code copyable>
          {localStorage.getItem("room_id")}
        </Typography.Title>
        <Typography.Text style={{ color: "rgba(50, 50, 50, 0.3)" }}>
          Copy to share the Room ID with friends!
        </Typography.Text>
      </div>
      <Spin
        spinning={!gameStarted}
        indicator={<LoadingOutlined />}
        tip={`Waiting for players to join... ${playerCount}/${roomCapacity}`}
      >
        <Room ref={roomRef} onClearAction={onClearAction} />
      </Spin>
      {renderStats()}
      <div className={isMobile ? "timeline-mobile" : "timeline"}>
        <Timeline mode="left" pending={pendingMsg} reverse>
          {renderTimelineItems().map((message, idx) => (
            <Timeline.Item key={idx} label={message.subject}>
              {message.message}
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </PlaygroundContext.Provider>
  );
}
