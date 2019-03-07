import React from "react";
import * as R from "ramda";
import styled from "@emotion/styled";
import { second } from "./Elevator.js";

const floorHeight = 200;

const Container = styled.div`
  background: rgb(200, 200, 200);
  display: flex;
  flex-direction: column-reverse;
`;

const Floor = styled.div`
  background: rgb(230, 240, 240);
  height: ${floorHeight}px;
  margin-bottom: 40px;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

const Indicators = styled.div`
  color: red;
  background: black;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-self: center;
  margin-right: 30px;
`;

const FloorIndicator = styled.div`
  text-align: center;
  width: 40px;
  font-weight: bold;
  font-size: 40px;
`;

const DirectionIndicator = styled.div`
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-bottom: 15px solid ${({ on }) => (on ? "red" : "rgb(100, 0, 0)")};
  transform: ${({ down }) => (down ? "rotate(180deg)" : "")};
`;

const DirectionIndicators = styled.div`
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const Doors = styled.div`
  border: 3px solid rgb(100, 100, 100);
  border-bottom: none;
  width: 140px;
  height: 170px;
  background: url(https://image.shutterstock.com/image-illustration/inside-elevator-260nw-121950307.jpg);
  background-position: center;
  background-size: 180%;
  overflow: hidden;

  position: relative;
  border-radius: 5px 5px 0 0;

  &::before {
    content: "";
    display: block;
    width: 50%;
    height: 100%;
    background: grey;
    border-right: 1px solid rgb(100, 100, 100);

    transform: translateX(${({ open }) => (open ? "-100%" : "0")});
    transition: transform 1s;
  }

  &::after {
    content: "";
    display: block;
    width: 50%;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
    background: grey;
    border-left: 1px solid rgb(100, 100, 100);
    transform: translateX(${({ open }) => (open ? "100%" : "0")});
    transition: transform 1s;
  }
`;

const OutsideButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  margin-left: 30px;
  background: rgb(150, 150, 150);
  padding: 10px;
  border-radius: 5px;
  border: 2px solid rgb(100, 100, 100);
`;

const Button = styled.div`
  width: 35px;
  height: 35px;
  background: rgb(100, 100, 100);
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid ${({ on }) => (on ? "rgb(200, 0, 0)" : "rgb(100, 0, 0)")};
  transition: box-shadow 0.15s, transform 0.15s;

  &:first-child {
    margin-bottom: 10px;
  }

  &:hover {
    box-shadow: 0 3px 5px rgba(0,0,0,0.5);
    transform: translateY(-3px);
  }
`;

const Cabin = styled.div``;

function GraphicalElevator({ numFloors, state, onFloorCall }) {
  return (
    <Container>
      {state.outside.map((floor, index) => (
        <Floor>
          <Indicators>
            <FloorIndicator>{floor.floor}</FloorIndicator>
            <DirectionIndicators>
              <DirectionIndicator up on={floor.up} />
              <DirectionIndicator down on={floor.down} />
            </DirectionIndicators>
          </Indicators>
          <Doors open={floor.doorsOpen} />
          <OutsideButtons>
            <Button
              on={floor.upButton}
              onClick={() => onFloorCall(index, true, false)}
            />
            <Button
              on={floor.downButton}
              onClick={() => onFloorCall(index, false, true)}
            />
          </OutsideButtons>
        </Floor>
      ))}
      <Cabin />
    </Container>
  );
}

export default GraphicalElevator;
