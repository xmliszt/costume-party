import { IAvatarProps } from "./avatar";
import IPlayerProps from "./player";
import { ITurn } from "./room";

export default interface IPlaygroundContext {
  globals: Array<number>;
  playersData: Array<IPlayerProps>;
  playerStats: IPlayerProps;
  playerAvatarProps: IAvatarProps;
  avatars: Array<IAvatarProps>;
  gameStarted: boolean;
  playerCount: number;
  roomCapacity: number;
  playerTurn: number;
  gameEnd: boolean;
  winner: string;
  turns: Array<ITurn>;
}
