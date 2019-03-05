import React, {Component} from 'react';
import * as R from 'ramda';
import { numFloors, second } from './Elevator';

class StandardModeController extends Component
{
  state = {
    queue: R.pipe(
      R.range,
      R.map(() => ({up: false, down: false, undirected: false}))
    )(0, numFloors),
    isGoingUp: false,
    moving: false,
    idle: true,
  }

  componentDidMount = () =>
  {
    this.props.registerListeners(this.listeners);
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
    const nextFloor = this.getNextDestination();
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
      if ( ! this.state.moving )
      {
        commands.setCabinDoors(R.T);
        commands.setFloorDoors(state => ({ floor: state.floor, isDoorsOpen: true }))
      }
    },

    /**
    * onDoorCloseRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onDoorCloseRequest: (commands) => {
      commands.setCabinDoors(R.F);
      commands.setFloorDoors(state => ({ floor: state.floor, isDoorsOpen: false }))
    },

    /**
    * onFloorArrival
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onFloorArrival: (commands) => {
      // Open the doors
      this.listeners.onDoorOpenRequest(commands);
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
      if ( this.state.moving )
        console.error("Doors opened while moving");

      setTimeout(() => this.listeners.onDoorCloseRequest(commands), 3 * second);
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
  })).bind(this)();

  render()
  {
    return(
      <div />
    );
  }

}

export default StandardModeController;