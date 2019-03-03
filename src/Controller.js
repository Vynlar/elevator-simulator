import React, { Component } from 'react';
import * as R from 'ramda';
import { numFloors } from './Elevator';

export default class Controller extends Component {

  /**
   * Initial state
   * Use this.setState() to change the state.
   * Do not use assignment! e.x. this.state.foo = 'bar'; <-- this will break everything
   */
  state = {
    queue: R.pipe(
      R.range,
      R.map(() => ({up: false, down: false, undirected: false}))
    )(0, numFloors),
    isGoingUp: false,
    moving: false,
    idle: true,

    put: 'whatever state you want here',
    itCanBeNumbers: 7,
    orEvenOtherObjects: {
      like: 'this!',
    },
    arraysAreCoolToo: [ 1, 2, 3, 4 ],
  }

  addRequest = (type, floor) =>
  {
    this.setState(R.assocPath(['queue', floor, type], true));
  }

  clearRequest = (type, floor) =>
  {
    this.setState(R.assocPath(['queue', floor, type], false));
  }

  getNextDestination = () =>
  {
    //TODO: implement a not-stupid queueing alg
    return R.findIndex(R.pipe(R.values, R.any(R.identity)))(this.state.queue);
  }

  goToNextFloor = (commands) =>
  {
    const nextFloor = getNextDestination();
    if ( nextFloor === -1 )
    {
      this.setState({idle: true});
      return;
    }

    commands.goToFloor( () => nextFloor );
  }

  listeners = (() => ({
    /**
    * onFloorCall
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @param {number} floor Index of the floor
    * @param {bool} up True if the request was up
    * @param {bool} down True if the request was down
    * @returns {void}
    */
    onFloorCall: (commands, floor, up, down) => {
      if ( up === down )
      {
        console.error("Received an invalid floor request");
        return;
      }

      this.addRequest(up ? "up": "down", floor);

      commands.setOutsideButtonLights(() => ({floor, up, down}));

      if ( this.state.idle )
      {
        //TODO: close doors
        this.setState({idle: false});
        this.goToNextFloor(commands);
      }
    },

    /**
    * onCabinRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @param {number} floor Index of the requested floor
    * @returns {void}
    */
    onCabinRequest: (commands, floor) => {
      
      this.addRequest("undirected", floor);

      commands.setCabinRequestButtonLight(() => ({floor, value: true}));

      if ( this.state.idle )
      {
        this.setState({idle: false});
        this.goToNextFloor(commands);
      }
    },

    /**
    * onDoorOpenRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onDoorOpenRequest: (commands) => {
    },

    /**
    * onDoorCloseRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onDoorCloseRequest: (commands) => {
    },

    /**
    * onFloorArrival
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onFloorArrival: (commands) => {
      // Open the doors
      commands.setCabinDoors(() => true);
      // Open the floor doors
      commands.setFloorDoors(state => ({ floor: state.floor, isDoorsOpen: true }))
      // TODO: update each floor's direction indicator
      // update each floor's floor indicator
      R.pipe(
        R.range(0),
        R.forEach((floor) => {
          commands.setOutsideFloorIndicator(state => ({ floor, value: state.floor }));
        })
      )(numFloors);

      // update cabin floor indicator
      commands.setCabinFloorIndicator(state => state.floor);

      this.setState({moving: false});
      // TODO: update cabin's direction indicator
      // TODO: remove from queue
    },

    /**
    * onCabinDoorsClosed
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsClosed: (commands) => {
      this.goToNextFloor();
    },

    /**
    * onCabinDoorsOpened
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsOpened: (commands) => {
    },

    /**
    * onFloorDoorsOpened
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @param {number} floor The index of the floor whose doors opened
    * @returns {void}
    */
    onFloorDoorsOpened: (commands, floor) => {
    },

    /**
    * onFloorDoorsClosed
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @param {number} floor The index of the floor whose doors closed
    * @returns {void}
    */
    onFloorDoorsClosed: (commands, floor) => {
    },

    /**
     * onFireAlarm
     * Called once when the fire alarm is first triggered
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onFireAlarm: (commands) => {
    },
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
      <Shell listeners={this.listeners} />
    );
  }
}
