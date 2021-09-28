/**
 * The action section where the player either throw the dice, or perform action, or watch other player's action status
 */
import { Button } from "antd";
import { colors } from "../constants";
import "./Action.css";

export default function Action({ turn }: { turn: number }): React.ReactElement {
  return (
    <>
      <div className="action">
        <Button size="large" type="primary" danger>
          YOUR TURN
        </Button>
      </div>
    </>
  );
}
