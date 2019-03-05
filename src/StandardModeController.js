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
    areDoorsOpen: false,
  }

  componentDidMount = () =>
  {
    this.props.registerListeners(this.listeners);
  }


  addRequest = (type, floor, commands) =>
  {
    this.setState(R.assocPath(['queue', floor, type], true),
      () => this.goToNextFloor(commands));
  }

  clearRequest = (type, floor) =>
  {
    this.setState(R.assocPath(['queue', floor, type], false));
  }

  goToNextDestination = (state) =>
  {
    const nextFloor = R.findIndex(R.pipe(R.values, R.any(R.identity)))(this.state.queue);
    
    const floorIndicatorF = (floor) => ({floor,
      up: (state.floor < nextFloor),
      down: (state.floor > nextFloor)});
    const cabinIndicatorF = () => ({up: (state.floor < nextFloor),
      down: (state.floor > nextFloor)});

    R.pipe(
      R.range(0),
      R.forEach((floor) => {
        commands.setOutsideDirectionIndicator(floorIndicatorF(floor));
      })
    )(numFloors);
    commands.setCabinDirectionIndicator(cabinIndicatorF);
    //TODO: implement a not-stupid queueing alg
  }

  goingToDestination = state =>
  {
    
  }

  goToNextFloor = (commands) =>
  {
    if ( this.state.areDoorsOpen || this.state.moving )
    {
      return;
    }


    this.setState({moving: true}, 
      () => commands.goToFloor( 
        (state) => this.goToNextDestination(state),
        (state) => this.goingToDestination(state) ));

  }

  closeDoors = (commands) =>
  {
    commands.setCabinDoors(R.F);
    commands.setFloorDoors(state => ({ floor: state.floor, isDoorsOpen: false }));
  }

  openDoorsAttempt = (commands) =>
  {
    if ( ! this.state.moving )
    {
      commands.setCabinDoors(R.T);
      commands.setFloorDoors(state => ({ floor: state.floor, isDoorsOpen: true }))
    }
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

      this.addRequest(up ? "up": "down", floor, commands);

      commands.setOutsideButtonLights(() => ({floor, up, down}));
    },

    /**
    * onCabinRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @param {number} floor Index of the requested floor
    * @returns {void}
    */
    onCabinRequest: (commands, floor) => {

      this.addRequest("undirected", floor, commands);

      commands.setCabinRequestButtonLight(() => ({floor, value: true}));
    },

    /**
    * onDoorOpenRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onDoorOpenRequest: (commands) => {
      this.openDoorsAttempt(commands)
    },

    /**
    * onDoorCloseRequest
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onDoorCloseRequest: (commands) => {
      this.closeDoors(commands);
    },

    /**
    * onFloorArrival
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onFloorArrival: (commands) => {
      // Open the doors
      // TODO: update each floor's direction indicator
      // update each floor's floor indicator
      R.pipe(
        R.range(0),
        R.forEach((floor) => {
          commands.setOutsideFloorIndicator(state => ({ floor, value: state.floor }));
        })
      )(numFloors);

      // update outside button lights
      if (this.state.isGoingUp) {
        commands.setOutsideButtonLights(state => {
          const currentFloor = state.floor;
          return ({floor:state.floor, up:false, down:state.outside[currentFloor].buttonDown});
        });
      } else {
        commands.setOutsideButtonLights(state => {
          const currentFloor = state.floor;
          return ({floor:state.floor, down:false, up:state.outside[currentFloor].buttonUp});
        });
      }


      // update cabin floor indicator
      commands.setCabinFloorIndicator(state => state.floor);

      this.setState({moving: false}, () => this.openDoorsAttempt(commands));
      // TODO: update cabin's direction indicator
      // TODO: remove from queue
    },

    /**
    * onCabinDoorsClosed
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsClosed: (commands) => {
      this.setState({areDoorsOpen: false}, () => this.goToNextFloor(commands));
    },

    /**
    * onCabinDoorsOpened
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsOpened: (commands) => {
      if ( this.state.moving )
        console.error("Doors opened while moving");

      this.setState({areDoorsOpen: true}, () =>
        setTimeout(() => this.closeDoors(commands), 3 * second));
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
