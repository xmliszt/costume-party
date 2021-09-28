export interface IAvatarPosition {
  x: number;
  y: number;
}

export interface IAvatarProps {
  id: string;
  position: IAvatarPosition;
  imageUrl: string;
  strokeColor: string;
}
