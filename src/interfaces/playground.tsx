import { IAvatarPosition } from "./avatar";

export default interface IAvatars {
  id: number;
  position: IAvatarPosition;
  imageUrl: string;
  strokeColor: string;
}
