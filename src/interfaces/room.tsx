export default interface IRoom {
  _id: string;
  turn: number;
  players: Array<number>;
  capacity: number;
  start: boolean;
}
