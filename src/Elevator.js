import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import GraphicalElevator from './GraphicalElevator';

export const numFloors = 5;
const second = 500;

export const FIRE_KEY = {
  OFF: 'OFF',
  ON: 'ON',
  RESET: 'RESET',
}

class Elevator extends Component {
  static propTypes = {
    listeners: PropTypes.objectOf(PropTypes.func),
  }

  state = {
    floor: 0,
    outside: R.pipe(
      R.range,
      R.map(floor => ({
        floor: 0,
        up: false,
        down: false,
        upButton: false,
        downButton: false,
        doorsOpen: false,
      }))
    )(0, numFloors),
    cabin: {
      floor: 0,
      up: false,
      down: false,
      doorsOpen: false,
      fireKeyPosition: FIRE_KEY.OFF,
      buttons: R.pipe(
        R.range,
        R.map(floor => ({
          lightOn: false,
        })),
      )(0, numFloors)
    }
  }

  commands = ((self) => ({
    /**
     * goToFloor
     * @arg {func} f (state) => new floor index [number]
     * @returns {void}
     */
    goToFloor (f) {
      const newFloor = f(self.state.floor);
      setTimeout(() => {
        self.setState(
          (state) => ({ floor: f(state) }),
          () => {
            self.props.listeners.onFloorArrival(self.commands);
          }
        );
      }, second * Math.abs(newFloor - self.state.floor) * 2)
    },
    /**
     * setCabinDoors
     * @arg {func} f (state) => isDoorsOpen [bool]
     */
    setCabinDoors(f) {
      setTimeout(() => {
        self.setState(state => R.assocPath(['cabin', 'doorsOpen'], f(state), state), () => {
          if(self.state.cabin.doorsOpen) {
            self.props.listeners.onCabinDoorsOpened(self.commands);
          } else {
            self.props.listeners.onCabinDoorsClosed(self.commands);
          }
        });
      }, second * 1);
    },
    /**
     * setFloorDoors
     * @param {func} f (state) => ({ isDoorsOpen:bool, floor:number })
     */
    setFloorDoors(f) {
      setTimeout(() => {
        let newFloor = 0;
        self.setState(state => {
          const { isDoorsOpen, floor } = f(state);
          newFloor = floor;
          return R.assocPath(['outside', floor, 'doorsOpen'], isDoorsOpen)(state);
        }, () => {
          self.props.listeners.onFloorDoorsOpened(self.commands, newFloor);
        });
      }, second * 1);
    },
    /**
     * setOutsideFloorIndicator
     * @param {func} f (state) => ({ floor:number, value:number })
     */
    setOutsideFloorIndicator(f) {
      self.setState(state => {
        const { floor, value } = f(state);
        return R.assocPath(['outside', floor, 'floor'], value)(state);
      });
    },
    /**
     * setCabinFloorIndicator
     * @param {func} f (state) => value:number
     */
    setCabinFloorIndicator(f) {
      self.setState(state => {
        return R.assocPath(['cabin', 'floor'], f(state))(state);
      });
    },
    /**
     * setCabinDirectionIndicator
     * @param {func} f (state) => ({ up:bool, down:bool })
     */
    setCabinDirectionIndicator(f) {
      self.setState(state => {
        const { up, down } = f(state);
        return R.pipe(
          R.assocPath(['cabin', 'up'], up),
          R.assocPath(['cabin', 'down'], down),
        )(state);
      });
    },
    /**
     * setOutsideDirectionIndicator
     * @param {func} f (state) => ({ floor:number, up:bool, down:bool })
     */
    setOutsideDirectionIndicator(f) {
      self.setState(state => {
        const { floor, up, down } = f(state)
        return R.pipe(
          R.assocPath(['outside', floor, 'up'], up),
          R.assocPath(['outside', floor, 'down'], down),
        )(state);
      });
    },
    /**
     * setOutsideButtonLights
     * @param {func} f (state) => ({ floor:number, up:bool, down:bool })
     */
    setOutsideButtonLights(f) {
      self.setState(state => {
        const { floor, up, down } = f(state);
        return R.pipe(
          R.assocPath(['outside', floor, 'buttonUp'], up),
          R.assocPath(['outside', floor, 'buttonDown'], down),
        )(state);
      });
    },
    /**
     * setCabinRequestButtonLight
     * @param {func} f (state) => ({ floor:number, value:number })
     */
    setCabinRequestButtonLight(f) {
      self.setState(state => {
        const { floor, value } = f(state);
        return R.assocPath(['cabin', 'buttons', floor, 'lightOn'], value)(state);
      });
    },
  }))(this)

  render() {
    return (
      <div>
          <GraphicalElevator numFloors={numFloors} />
          <div>
              <h2>General</h2>
              <div>
                  Floor: {this.state.floor}
              </div>
          </div>
          <div>
              <h2>Cabin</h2>
              <div>
                  Floor indicator: {this.state.cabin.floor}
              </div>
              <div>
                  Doors: {this.state.cabin.doorsOpen ? 'OPEN' : 'CLOSED'}
              </div>
              <div>
                  Up: {this.state.cabin.up ? 'ON' : 'OFF' }
              </div>
              <div>
                  Down: {this.state.cabin.down ? 'ON' : 'OFF' }
              </div>
              <div>
                  Fire key position: {this.state.cabin.fireKeyPosition}
              </div>
              <h3>Buttons</h3>
              <div>
                  {this.state.cabin.buttons.map(({ lightOn }, index) => (
                    <div key={index}>
                        {index}: {lightOn ? 'ON' : 'OFF'}
                    </div>
                  ))}
              </div>
          </div>
          <div>
              <h2>Outside</h2>
              <div>
                  {R.range(0, numFloors).map(floor => (
                    <div key={floor}>
                        <h3>Floor {floor}</h3>
                        <div>
                            Floor indicator: {this.state.outside[floor].floor}
                        </div>
                        <div>
                            Doors open: {this.state.outside[floor].doorsOpen ? 'OPEN' : 'CLOSED'}
                        </div>
                        <div>
                            Up: {this.state.outside[floor].up ? 'ON' : 'OFF'}
                        </div>
                        <div>
                            Down: {this.state.outside[floor].down ? 'ON' : 'OFF'}
                        </div>
                        <div>
                            Button Up: {this.state.outside[floor].buttonUp ? 'ON' : 'OFF'}
                        </div>
                        <div>
                            Button Down: {this.state.outside[floor].buttonDown ? 'ON' : 'OFF'}
                        </div>
                    </div>
                  ))}
              </div>
          </div>
          <div>
              <h2>Override Events</h2>
              <button onClick={() => this.commands.goToFloor(() => 3)}>Go To Floor 3</button>
              <button onClick={this.commands.openCabinDoors}>Open cabin doors</button>
              <button onClick={this.commands.closeCabinDoors}>Close cabin doors</button>
          </div>
      </div>
    );
  }
}

export default Elevator;