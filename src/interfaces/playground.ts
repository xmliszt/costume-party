import { IAvatarProps } from "./avatar";
import IPlayerProps from "./player";

export default interface IPlaygroundContext {
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
}
