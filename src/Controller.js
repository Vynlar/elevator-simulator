import React, { Component } from "react";
import * as R from "ramda";
import { numFloors, second } from "./Elevator";

import StandardModeController from "./StandardModeController";
import EmergencyModeController from "./EmergencyModeController";

const EMERGENCY_TIMEOUT = 30 * 60;

export default class Controller extends Component {
  /**
   * Initial state
   * Use this.setState() to change the state.
   * Do not use assignment! e.x. this.state.foo = 'bar'; <-- this will break everything
   */
  state = {
    isEmergency: false,
    childListeners: null,
    secondsRemainingInEM: 0,

    put: "whatever state you want here",
    itCanBeNumbers: 7,
    orEvenOtherObjects: {
      like: "this!"
    },
    arraysAreCoolToo: [1, 2, 3, 4]
  };

  registerListeners = (listeners, cb = () => {}) => {
    this.setState({ childListeners: listeners }, cb);
  };

  goToFirstFloor = (commands, currentElevatorFloor) => {};

  counterSeconds = (n, cb, cbFinished) => {
    if (n < 0) {
      cbFinished();
      return;
    } else {
      setTimeout(() => {
        this.counterSeconds(n - 1, cb, cbFinished);
        cb(n);
      }, 1000);
    }
  };

  listeners = (() => ({
    /**
     * onFireAlarm
     * Called once when the fire alarm is first triggered
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onFireAlarm: (commands, currentElevatorFloor) => {
      // Enable emergency
      this.setState({ isEmergency: true });
      console.log("FIRE! FIRE!");
      console.log("In emergency ", this.state.isEmergency);

      this.counterSeconds(
        EMERGENCY_TIMEOUT,
        n => {
          this.setState({ secondsRemainingInEM: n });
        },
        () => this.setState({ isEmergency: false })
      );

      for (let i = 0; i < numFloors; i++) {
        commands.setOutsideButtonLights(() => {
          return {
            floor: i,
            up: false,
            down: false
          };
        });
        commands.setCabinRequestButtonLight(state => ({
          floor: i,
          value: false
        }));
      }

      // execute initial routine service
      // if on first floor, just open doors
      if (currentElevatorFloor === 0) {
        commands.setCabinDoors(R.T);
        commands.setFloorDoors(state => ({
          floor: state.floor,
          isDoorsOpen: true
        }));
        console.log("Already on first floor");
      } else {
        commands.setCabinDoors(R.F); // close doors
        commands.setFloorDoors(
          state => ({ floor: state.floor, isDoorsOpen: false }),
          () => {
            // after closing floor doors, update outside lights
            commands.setCabinFloorIndicator(state => 0);
            // TODO: Fix this bug, same bug as in normal mode when trying to go down
            /* commands.setOutsideFloorIndicator(state => ({ floor: 0, value: 0 }));
             * commands.setOutsideDirectionIndicator(state => ({
             *   up: false,
             *   down: true,
             * })); */
          }
        );
        commands.goToFloor(
          state => 0,
          () => {
            commands.setCabinDoors(R.T); // close doors
            commands.setFloorDoors(state => ({
              floor: state.floor,
              isDoorsOpen: true
            }));
          }
        ); // take in the state and just go to floor 0
        console.log("Not first floor");
      }
    },
    onFireKeyChange: (commands, position) => {
      // TODO: change to emergency mode if ON
      if (this.state.isEmergency) {
        this.state.childListeners.onFireKeyChange(commands, position);
      }
    }
  })).bind(this)();

  // Feel free to add more functions as they are needed. Here's an example:
  /*
  myUtilityFunction(numbers, importantData) {
    return numbers + importantData;
  }
  */
  // Call it by using: `this.myUtilityFunction(5, 2);`

  render() {
    const Shell = this.props.shell;
    return (
      <div>
        {this.state.isEmergency ? (
          <div>
            <EmergencyModeController
              registerListeners={this.registerListeners}
            />
            <h3>
              {Math.floor(this.state.secondsRemainingInEM / 60)}:
              {this.state.secondsRemainingInEM % 60}
            </h3>
          </div>
        ) : (
          <StandardModeController registerListeners={this.registerListeners} />
        )}
        <Shell
          listeners={{ ...this.state.childListeners, ...this.listeners }}
        />
      </div>
    );
  }
}
