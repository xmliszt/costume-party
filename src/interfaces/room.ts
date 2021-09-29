export default interface IRoom {
  _id: string;
  turn: number;
  players: Array<number>;
  capacity: number;
  gameEnd: boolean;
  winner: string;
}
