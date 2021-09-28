export interface IAvatarPosition {
  x: number;
  y: number;
}

export interface IAvatarProps {
  id: number;
  position: IAvatarPosition;
  imageUrl: string;
  strokeColor: string;
}
