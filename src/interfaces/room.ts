export interface ISlot {
  index: number;
  roomType: string;
  color: string;
  occupied: boolean;
  occupiedBy?: number;
}
export interface IRoom {
  _id: string;
  turn: number;
  players: Array<number>;
  capacity: number;
  gameEnd: boolean;
  winner: string;
}
