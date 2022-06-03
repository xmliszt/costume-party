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

// status: choosing (roll), waiting, picking (move target), moving (move dest), killing, kill (killed action performed) dead
export interface ITurn {
  turn: number; // the turn number
  actor: string; // acting player nickname
  status: string; // see above comment
  action: number | null; // for choosing
  fromRoom: string | null; // from room type
  fromPosition: number | null; // from position index
  toRoom: string | null; // to room type
  toPosition: number | null; // to position index
  avatarID: number | null; // position index of avatar moved
  killedPlayer: string | null; // killed player nickname
}
