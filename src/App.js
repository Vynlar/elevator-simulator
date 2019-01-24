import React, { Component } from 'react';
import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';
import 'normalize.css';
import * as R from 'ramda';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding-top: 80px;
  padding-bottom: 25px;
  background: rgb(51, 224, 221);
  position: relative;

  &::after {
    content: "";
    width: 100%;
    height: 75px;
    position: absolute;
    bottom: 0;
    background: rgb(28, 201, 88);
  }
`;

const Button = styled.div`
  cursor: pointer;
  padding: 8px 10px;
  background: white;
  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 3px;
  margin-bottom: 8px;
  text-align: center;
  color: black;
  user-select: none;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 6px rgba(0,0,0,0.3);
  }
`;

const ControlPanel = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 20px;
  background: #eeeeee;
  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
  border: 6px solid #333333;
  border-radius: 8px;
`;

const Building = styled.div`
  background: #555555;
  width: 500px;
  color: white;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 5;
  position: relative;

  &::before {
    content: 'ACME Corp.';
    position: absolute;
    z-index: 20;
    font-weight: bold;
    font-size: 60px;
    top: -58px;
    color: #333;
  }
`;

const Floor = styled.div`
  background: #777777;
  height: 200px;
  margin-bottom: 10px;
  position: relative;
  z-index: 0;
`;

const FloorButtons = styled.div`
  position: absolute;
  top: 60px;
  left: 120px;
`;

const Elevator = styled.div`
  height: 180px;
  width: 120px;
  background: #eeeeee;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%) translateY(${({ floor }) => 10 + (5-floor) * (200+10)}px);
  transition: transform 0.5s;
  z-index: 20;
`;

class App extends Component {
  constructor(props) {
    super(props);

    const makeFloor = () => ({
      up: false,
      down: false,
      dropoff: false,
    });

    this.state = {
      floor: 1,
      requests: R.pipe(
        R.map(floor => [floor, makeFloor()]),
        R.fromPairs,
      )([1,2,3,4,5]),
    };
  }

  goUp = () => {
    this.setState(state => ({
      floor: R.clamp(1, 5, state.floor + 1),
    }));
  }

  goDown = () => {
    this.setState(state => ({
      floor: R.clamp(1, 5, state.floor - 1),
    }));
  }

  requestUp = floor => {
    this.setState(R.assocPath(['requests', floor, 'up'], true));
  }

  requestDown = floor => {
    this.setState(R.assocPath(['requests', floor, 'down'], true));
  }

  requestDropoff = floor => {
    this.setState(R.assocPath(['requests', floor, 'dropoff'], true));
  }

  render() {
    return (
      <Container>
        <Building>
          <Elevator floor={this.state.floor}></Elevator>
          {[1,2,3,4,5].map(floor => (
            <Floor key={floor}>
              <FloorButtons>
                <Button onClick={() => this.requestUp(floor)}>Up</Button>
                <Button onClick={() => this.requestDown(floor)}>Down</Button>
              </FloorButtons>
            </Floor>
          ))}
        </Building>
        <ControlPanel>
          <div>
            <Button onClick={this.goUp}>Up</Button>
            <Button onClick={this.goDown}>Down</Button>
            {[5,4,3,2,1].map(floor => (
              <Button key={floor} onClick={() => this.requestDropoff(floor)}>{floor}</Button>
            ))}
          </div>
          {
            R.pipe(
              R.addIndex(R.map)(({ up, down, dropoff }, index) => {
                return (
                  <div key={index}>
                    {up ? "Up" : '--'} |
                    {down ? "Down" : '--'}
                    {dropoff ? "Dropoff" : '--'}
                  </div>
                )
              }),
              R.values,
              R.reverse,
            )(this.state.requests)}
        </ControlPanel>
      </Container>
    );
  }
}

export default App;
