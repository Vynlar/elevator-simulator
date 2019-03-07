import React, { Component } from "react";
import PropTypes from "prop-types";
import * as R from "ramda";
import GraphicalElevator from "./GraphicalElevator";

export const numFloors = 5;
export const second = 1000;

export const FIRE_KEY = {
  OFF: "OFF",
  ON: "ON",
  RESET: "RESET"
};

const listStyle = {
  "list-style-type": "none"
};

class Elevator extends Component {
  static propTypes = {
    listeners: PropTypes.objectOf(PropTypes.func)
  };

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
        doorsOpen: false
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
          lightOn: false
        }))
      )(0, numFloors)
    }
  };

  changeKeyPosition = newPosition => {
    this.setState(R.assocPath(["cabin", "fireKeyPosition"], newPosition));
    this.props.listeners.onFireKeyChange(this.commands, newPosition);
  };

  commands = (self => ({
    /**
     * goToFloor
     * @arg {func} f (state) => new floor index [number]
     * @returns {void}
     */
    goToFloor(f, cb = () => {}) {
      setTimeout(() => {
        self.setState(
          state => ({ floor: f(state) }),
          () => {
            self.props.listeners.onFloorArrival(self.commands);
            cb(self.state);
          }
        );
      }, second);
    },
    /**
     * setCabinDoors
     * @arg {func} f (state) => isDoorsOpen [bool]
     */
    setCabinDoors(f, cb = () => {}) {
      setTimeout(() => {
        self.setState(
          state => R.assocPath(["cabin", "doorsOpen"], f(state), state),
          () => {
            if (self.state.cabin.doorsOpen) {
              self.props.listeners.onCabinDoorsOpened(self.commands);
            } else {
              self.props.listeners.onCabinDoorsClosed(self.commands);
            }
            cb(self.state);
          }
        );
      }, second * 1);
    },
    /**
     * setFloorDoors
     * @param {func} f (state) => ({ isDoorsOpen:bool, floor:number })
     */
    setFloorDoors(f, cb = () => {}) {
      setTimeout(() => {
        let newFloor = 0;
        self.setState(
          state => {
            const { isDoorsOpen, floor } = f(state);
            newFloor = floor;
            return R.assocPath(["outside", floor, "doorsOpen"], isDoorsOpen)(
              state
            );
          },
          () => {
            if (self.state.outside[newFloor].doorsOpen)
              self.props.listeners.onFloorDoorsOpened(self.commands, newFloor);
            else
              self.props.listeners.onFloorDoorsClosed(self.commands, newFloor);
            cb(self.state);
          }
        );
      }, second * 1);
    },
    /**
     * setOutsideFloorIndicator
     * @param {func} f (state) => ({ floor:number, value:number })
     */
    setOutsideFloorIndicator(f, cb = () => {}) {
      self.setState(
        state => {
          const { floor, value } = f(state);
          return R.assocPath(["outside", floor, "floor"], value)(state);
        },
        () => cb(self.state)
      );
    },
    /**
     * setCabinFloorIndicator
     * @param {func} f (state) => value:number
     */
    setCabinFloorIndicator(f, cb = () => {}) {
      self.setState(
        state => {
          return R.assocPath(["cabin", "floor"], f(state))(state);
        },
        () => cb(self.state)
      );
    },
    /**
     * setCabinDirectionIndicator
     * @param {func} f (state) => ({ up:bool, down:bool })
     */
    setCabinDirectionIndicator(f, cb = () => {}) {
      self.setState(
        state => {
          const { up, down } = f(state);
          return R.pipe(
            R.assocPath(["cabin", "up"], up),
            R.assocPath(["cabin", "down"], down)
          )(state);
        },
        () => cb(self.state)
      );
    },
    /**
     * setOutsideDirectionIndicator
     * @param {func} f (state) => ({ floor:number, up:bool, down:bool })
     */
    setOutsideDirectionIndicator(f, cb = () => {}) {
      self.setState(
        state => {
          const { floor, up, down } = f(state);
          return R.pipe(
            R.assocPath(["outside", floor, "up"], up),
            R.assocPath(["outside", floor, "down"], down)
          )(state);
        },
        () => cb(self.state)
      );
    },
    /**
     * setOutsideButtonLights
     * @param {func} f (state) => ({ floor:number, up:bool, down:bool })
     */
    setOutsideButtonLights(f, cb = () => {}) {
      self.setState(
        state => {
          const { floor, up, down } = f(state);
          return R.pipe(
            R.assocPath(["outside", floor, "upButton"], up),
            R.assocPath(["outside", floor, "downButton"], down)
          )(state);
        },
        () => cb(self.state)
      );
    },
    /**
     * setCabinRequestButtonLight
     * @param {func} f (state) => ({ floor:number, value:number })
     */
    setCabinRequestButtonLight(f, cb = () => {}) {
      self.setState(
        state => {
          const { floor, value } = f(state);
          return R.assocPath(["cabin", "buttons", floor, "lightOn"], value)(
            state
          );
        },
        () => cb(self.state)
      );
    },

    /**
     * getLatestState
     * @param {func} f (state) => ({ floor:number, value:number })
     */
    getLatestState(cb) {
      self.setState(() => ({}), () => cb(self.state));
    }
  }))(this);

  render() {
    return (
      <div>
        <GraphicalElevator
          numFloors={numFloors}
          state={this.state}
          onFloorCall={(...args) =>
            this.props.listeners.onFloorCall(this.commands, ...args)
          }
        />
        <div>
          <h2>Override Events</h2>
          <button
            onClick={() =>
              this.props.listeners.onFireAlarm(this.commands, this.state.floor)
            }
          >
            Simulate Fire Alarm
          </button>
          <button
            onClick={() =>
              this.props.listeners.onDoorOpenRequest(this.commands)
            }
          >
            Open cabin doors (cabin button)
          </button>
          <button
            onClick={() =>
              this.props.listeners.onDoorCloseRequest(this.commands)
            }
          >
            Close cabin doors (cabin button)
          </button>
          <div>
            <label htmlFor="firekey">
              ON
              <input
                name="firekey"
                type="radio"
                value={FIRE_KEY.ON}
                checked={this.state.cabin.fireKeyPosition == "ON"}
                onChange={() => this.changeKeyPosition(FIRE_KEY.ON)}
              />
            </label>
            <label htmlFor="firekey">
              OFF
              <input
                name="firekey"
                type="radio"
                value={FIRE_KEY.OFF}
                checked={this.state.cabin.fireKeyPosition == "OFF"}
                onChange={() => this.changeKeyPosition(FIRE_KEY.OFF)}
              />
            </label>
            <label htmlFor="firekey">
              RESET
              <input
                name="firekey"
                type="radio"
                value={FIRE_KEY.RESET}
                checked={this.state.cabin.fireKeyPosition === "RESET"}
                onChange={() => this.changeKeyPosition(FIRE_KEY.RESET)}
              />
            </label>
          </div>
          <ul style={listStyle}>
            <li>
              <button
                onClick={() =>
                  this.props.listeners.onCabinRequest(this.commands, 0)
                }
              >
                {" "}
                Cabin Floor 0 button
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  this.props.listeners.onCabinRequest(this.commands, 1)
                }
              >
                {" "}
                Cabin Floor 1 button
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  this.props.listeners.onCabinRequest(this.commands, 2)
                }
              >
                {" "}
                Cabin Floor 2 button
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  this.props.listeners.onCabinRequest(this.commands, 3)
                }
              >
                {" "}
                Cabin Floor 3 button
              </button>
            </li>
            <li>
              <button
                onClick={() =>
                  this.props.listeners.onCabinRequest(this.commands, 4)
                }
              >
                {" "}
                Cabin Floor 4 button
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h2>General</h2>
          <div>Floor: {this.state.floor}</div>
        </div>
        <div>
          <h2>Cabin</h2>
          <div>Floor indicator: {this.state.cabin.floor}</div>
          <div>Doors: {this.state.cabin.doorsOpen ? "OPEN" : "CLOSED"}</div>
          <div>Fire key position: {this.state.cabin.fireKeyPosition}</div>
          <div>Direction Indicator ^: {this.state.cabin.up ? "ON" : "OFF"}</div>
          <div>
            Direction Indicator v: {this.state.cabin.down ? "ON" : "OFF"}
          </div>
          <h3>Buttons</h3>
          <div>
            {this.state.cabin.buttons.map(({ lightOn }, index) => (
              <div key={index}>
                {index}: {lightOn ? "ON" : "OFF"}
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
                <div>Floor indicator: {this.state.outside[floor].floor}</div>
                <div>
                  Doors open:{" "}
                  {this.state.outside[floor].doorsOpen ? "OPEN" : "CLOSED"}
                </div>
                <div>
                  Button Up: {this.state.outside[floor].upButton ? "ON" : "OFF"}
                </div>
                <div>
                  Button Down:{" "}
                  {this.state.outside[floor].downButton ? "ON" : "OFF"}
                </div>
                <div>
                  Direction Indicator ^:{" "}
                  {this.state.outside[floor].up ? "ON" : "OFF"}
                </div>
                <div>
                  Direction Indicator v:{" "}
                  {this.state.outside[floor].down ? "ON" : "OFF"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Elevator;
