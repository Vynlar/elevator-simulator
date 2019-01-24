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
  transform: translateX(-50%) translateY(${({ floor }) => 10 + (4-floor) * (200+10)}px);
  transition: transform 0.5s;
  z-index: 20;
`;

const makeFloor = floor => ({
  up: false,
  down: false,
  dropoff: false,
  floor,
});


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      floor: 0,
      goingUp: true,
      requests: R.pipe(
        R.map(floor => makeFloor(floor)),
      )(R.range(0, 5)),
    };
  }

  goUp = () => {
    this.setState(state => ({
      floor: R.clamp(0, 4, state.floor + 1),
    }));
  }

  goDown = () => {
    this.setState(state => ({
      floor: R.clamp(0, 4, state.floor - 1),
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

  getRemainingStops = state => {
    const range = state.goingUp ? R.range(state.floor + 1, 5) : R.range(0, state.floor);
    const allFloors = R.compose(R.values, R.pickAll)(range, state.requests);
    const floors = R.pipe(
      R.reject(R.pipe(
        R.pick([state.goingUp ? 'up' : 'down', 'dropoff']),
        R.values,
        R.all(R.equals(false))
      )),
      R.sortBy(R.prop('floor')),
    )(allFloors);

    if(!state.goingUp) {
      return R.reverse(floors);
    }
    return floors;
  };

  goToNextFloor = () => {
    this.setState(state => {
      const remaniningStops = this.getRemainingStops(state);
      if (remaniningStops.length === 0) {
        const newRemainingStops = this.getRemainingStops(R.assoc('goingUp', !state.goingUp)(state));
        if(newRemainingStops.length === 0) {
          // No more remaning requests
          return {};
        }
        const newFloor = newRemainingStops[0].floor;
        return {
          goingUp: !state.goingUp,
          floor: newFloor,
          requests: R.update(newFloor, makeFloor(newFloor))(state.requests),
        };
      } else {
        const newFloor = remaniningStops[0].floor;
        return {
          floor: newFloor,
          requests: R.update(newFloor, makeFloor(newFloor))(state.requests),
        }
      }
    })
  }

  render() {
    return (
      <Container>
        <Building>
          <Elevator floor={this.state.floor}></Elevator>
          {[4,3,2,1,0].map(floor => (
            <Floor key={floor}>
              {floor}
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
            {[4,3,2,1,0].map(floor => (
              <Button key={floor} onClick={() => this.requestDropoff(floor)}>{floor}</Button>
            ))}
            <Button onClick={this.goToNextFloor}>TEST</Button>
          </div>
          {
            R.pipe(
              R.addIndex(R.map)(({ up, down, dropoff }, index) => {
                return (
                  <div key={index}>
                    {index}
                    {up ? "Up" : '--'} |
                    {down ? "Down" : '--'} |
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
