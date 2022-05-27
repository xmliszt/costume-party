import { HomeOutlined, MinusOutlined } from "@ant-design/icons";
import { Button, Row, Col, Empty } from "antd";
import React from "react";
import "./Room.css";
import { roomColorMapping, GRID } from "../constants";
import { makeSlotProps } from "../helpers/room";
import { isMobile } from "react-device-detect";

export default function Room(): React.ReactElement {
  const makeSlot = (roomType: string) => (
    <Button
      style={{
        backgroundColor: roomColorMapping[roomType] + "70",
        border: "1px dashed #00000050",
      }}
      ghost
      size={isMobile ? "small" : "large"}
      icon={<HomeOutlined />}
    ></Button>
  );
  const grid = [];
  let index = 0;
  for (let row = 0; row < GRID.GRID_ROW_LENGTH; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID.GRID_CLN_LENGTH; col++) {
      currentRow.push(makeSlotProps(index, row, col));
      index++;
    }
    grid.push(currentRow);
  }

  return (
    <div>
      {grid.map((row) => {
        return (
          <Row gutter={[1, 1]} style={{ justifyContent: "center" }}>
            {row.map((col) => {
              return <Col key={col.index}>{makeSlot(col.roomType)}</Col>;
            })}
          </Row>
        );
      })}
    </div>
  );
}
