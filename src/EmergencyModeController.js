import React, { Component } from "react";
import * as R from "ramda";
import { numFloors } from "./Elevator";

class EmergencyModeController extends Component {
  state = {
    executedEmergencyRoutine: false,
    areDoorsOpen: true, // opposite of SMC, our base state is the doors are open
    isGoingUp: false
  };

  componentDidMount = () => {
    this.props.registerListeners(this.listeners);
  };

  clearOutsideDirectionIndicators = commands => {
    // Clear the outside direction indicators
    R.pipe(
      R.range(0),
      R.forEach(floor => {
        commands.setOutsideDirectionIndicator(state => ({
          floor,
          up: false,
          down: false
        }));
      })
    )(numFloors);
    return;
  };

  listeners = (() => ({
    /**
     * onFireKeyChange
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @param {string} position one of { 'ON', 'OFF', 'RESET' }
     */
    onFireKeyChange: (commands, position) => {
      if (position === "OFF" || position === "RESET") {
        // doesn't matter first floor or not, repeat the steps
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
      }
    },
    /**
     * onFloorCall
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @param {number} floor Index of the floor
     * @param {bool} up True if the request was up
     * @param {bool} down True if the request was down
     * @returns {void}
     */
    onFloorCall: (commands, floor, up, down) => {
      // will do nothing, unless we setup fire key on each floor to request the elevator
    },

    /**
     * onFireAlarm
     * Called once when the fire alarm is first triggered
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onFireAlarm: (commands, currentElevatorFloor) => {},

    /**
     * onCabinRequest
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @param {number} floor Index of the requested floor
     * @returns {void}
     */
    onCabinRequest: (commands, requestedFloor) => {
      if (this.state.areDoorsOpen) {
        console.log("Do nothing, the doors are open!");
        return;
      }

      commands.getLatestState(state => {
        if (state.cabin.fireKeyPosition === "ON") {
          this.clearOutsideDirectionIndicators(commands);

          // Update the cabin direction indicator with the current direction, same as SMC
          commands.setCabinDirectionIndicator(state => {
            const goingUp = requestedFloor > state.floor;

            // Keep track of which floor we are going to
            this.setState({ isGoingUp: goingUp });

            return {
              up: goingUp,
              down: !goingUp
            };
          });

          R.pipe(
            R.range(0),
            R.forEach(floor => {
              commands.setOutsideDirectionIndicator(state => {
                const goingUp = requestedFloor > state.floor;

                return {
                  floor,
                  up: goingUp,
                  down: !goingUp
                };
              });
            })
          )(numFloors);

          commands.setCabinRequestButtonLight(state => ({ floor: requestedFloor, value: true }));

          // simply go to requested floor, don't open any doors
          console.log("Going straight to: ", requestedFloor);
          commands.goToFloor(state => requestedFloor, () => {});
        }
      });
    },

    /**
     * onDoorOpenRequest
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onDoorOpenRequest: commands => {
      commands.getLatestState(state => {
        if (state.cabin.fireKeyPosition === "ON") {
          // don't close doors after any time
          this.setState({ areDoorsOpen: true });
          commands.setCabinDoors(R.T);
          commands.setFloorDoors(state => ({
            floor: state.floor,
            isDoorsOpen: true
          }));
          console.log("Open doors");
        }
      });
    },

    /**
     * onDoorCloseRequest
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onDoorCloseRequest: commands => {
      commands.getLatestState(state => {
        if (state.cabin.fireKeyPosition === "ON") {
          this.setState({ areDoorsOpen: false });
          commands.setCabinDoors(R.F);
          commands.setFloorDoors(state => ({
            floor: state.floor,
            isDoorsOpen: false
          }));
          console.log("Close doors");
          console.log(this.state.areDoorsOpen);
        }
      });
    },

    /**
     * onFloorArrival
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onFloorArrival: commands => {
      console.log("Arrived at floor");
      // update each floor's floor indicator
      R.pipe(
        R.range(0),
        R.forEach(floor => {
          commands.setOutsideFloorIndicator(state => ({
            floor,
            value: state.floor
          }));
        })
      )(numFloors);

      // update direction indicators
      this.clearOutsideDirectionIndicators(commands);
      commands.setCabinRequestButtonLight(state => ({ floor: state.floor, value: false }));

      // update cabin floor indicator
      commands.setCabinFloorIndicator(state => state.floor);
    },

    /**
     * onCabinDoorsClosed
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onCabinDoorsClosed: commands => {
      // just close doors, don't need to handle any requests
      this.setState({ areDoorsOpen: false });
    },

    /**
     * onCabinDoorsOpened
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onCabinDoorsOpened: commands => {
      this.setState({ areDoorsOpen: true });
    },

    /**
     * onFloorDoorsOpened
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @param {number} floor The index of the floor whose doors opened
     * @returns {void}
     */
    onFloorDoorsOpened: (commands, floor) => {},

    /**
     * onFloorDoorsClosed
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @param {number} floor The index of the floor whose doors closed
     * @returns {void}
     */
    onFloorDoorsClosed: (commands, floor) => {}
  })).bind(this)();

  render() {
    return <h1>Emergency Mode</h1>;
  }
}

export default EmergencyModeController;
