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

  isQueueEmpty = () =>
    R.all(
      R.pipe(
        R.values, R.all(R.equals(false))
      )
    )(this.state.queue);

  componentDidMount = () =>
  {
    this.props.registerListeners(this.listeners);
  }

  addRequest = (type, floor, commands) => {
    this.setState(R.assocPath(['queue', floor, type], true),
      () => this.goToNextFloor(commands));
  }

  clearRequest = (type, floor) => {
    this.setState(R.assocPath(['queue', floor, type], false));
  }

  getNextDestination = (state) => {
    const nextDirection = this.shouldChangeDirection(state.floor) ?
        !this.state.isGoingUp : this.state.isGoingUp;

    this.setState({ isGoingUp: nextDirection });

    // find the next "same direction" request
    const sameDirectionFloors = this.getSameDirectionFloors(state.floor, nextDirection);
    const direction = nextDirection ? 'up' : 'down';
    const validFloors =
    R.pipe(
        // turn array [a, b, c] into [[0, a], [1, b], [2, c]]
        R.addIndex(R.map)((x, index) => [index, x]),
        // Filters based on the requests
        R.filter(([index, requests]) =>
            requests[direction] || requests.undirected
        ),
        R.map(R.head),
    )(sameDirectionFloors);

    // If there are no more requests in the same direction, get the highest (if currently going up)
    // or lowest (if going down), request in the opposite direction.
    if ( validFloors.length === 0 ) {
      const oppositeDirection = ! nextDirection ? 'up' : 'down';
      const validOppositeRequests =
      R.pipe(
          // turn array [a, b, c] into [[0, a], [1, b], [2, c]]
          R.addIndex(R.map)((x, index) => [index, x]),
          // Filters based on the requests
          R.filter(([index, requests]) =>
              requests[oppositeDirection] || requests.undirected
          ),
          R.map(R.head),
      )(sameDirectionFloors);
      if(oppositeDirection === "up") {
        const result = validOppositeRequests[0];
        return result;
      } else {
        return R.last(validOppositeRequests) + state.floor + 1;
      }
    }

    if(direction === "up") {
      const result = validFloors[0] + state.floor + 1;
      return result;
    } else {
      return R.last(validFloors);
    }
  }

  goToNextFloor = (commands) => {
    if ( this.state.areDoorsOpen || this.state.moving ) return;
    if (this.isQueueEmpty()) {
      // This is the idle state
      console.log('going into idle');

      // Clear the cabin direction indicators
      commands.setCabinDirectionIndicator(() => ({ up: false, down: false }));

      // Clear the outside direction indicators
      R.pipe(
        R.range(0),
        R.forEach((floor) => {
          commands.setOutsideDirectionIndicator(state => ({
            floor,
            up: false,
            down: false,
          }))
        })
      )(numFloors);
      return;
    }


    // Update the cabin direction indicator with the current direction
    commands.setCabinDirectionIndicator(state => {
      const nextFloor = this.getNextDestination(state);
      const goingUp = nextFloor > state.floor;

      // Keep track of which floor we are going to
      this.setState({ isGoingUp: goingUp });

      return ({
        up: goingUp,
        down: !goingUp,
      });
    });

    R.pipe(
      R.range(0),
      R.forEach((floor) => {
        commands.setOutsideDirectionIndicator(state => {
          const nextFloor = this.getNextDestination(state);
          const goingUp = nextFloor > state.floor;

          return ({
            floor,
            up: goingUp,
            down: !goingUp,
          })
        });
      })
    )(numFloors);

    this.setState({ moving: true },
      () => commands.goToFloor((state) => this.getNextDestination(state))
    );
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

  getSameDirectionFloors = (floor, isGoingUp) => {
    const { queue } = this.state;
    const remainingFloors = isGoingUp ? (
      R.slice(floor + 1, Infinity)(queue)
    ) : (
      R.slice(0, floor)(queue)
    );

    return remainingFloors;
  }

  shouldChangeDirection = (floor) => {
    const { queue, isGoingUp } = this.state;
    // get the remaining floors
    const sameDirectionFloors = this.getSameDirectionFloors(floor, isGoingUp);
    // check for requests, if there are any, return false, else true
    return R.pipe(
      R.map(R.values), // turn into 2d boolean array
      R.flatten, // turn into 1d boolean array
      R.none(R.equals(true)), // make sure none are true
    )(sameDirectionFloors);
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
      // update each floor's floor indicator
      R.pipe(
        R.range(0),
        R.forEach((floor) => {
          commands.setOutsideFloorIndicator(state => ({ floor, value: state.floor }));
        })
      )(numFloors);

      // update cabin floor indicator
      commands.setCabinFloorIndicator(state => state.floor);

      // Open the doors
      this.setState({ moving: false }, () => this.openDoorsAttempt(commands));

      // remove from queue
      commands.getLatestState(state => {
        const shouldChangeDirection = this.shouldChangeDirection(state.floor);
        if ( shouldChangeDirection )
        {
          this.clearRequest('up', state.floor);
          this.clearRequest('down', state.floor);
          commands.setOutsideButtonLights(() => {
            return ({
              floor: state.floor,
              up: false,
              down: false,
            });
          });
        }
        else {
          this.clearRequest(this.state.isGoingUp ? 'up' : 'down', state.floor);
          commands.setOutsideButtonLights(() => {
            const currentFloor = state.floor;
            return ({
              floor: currentFloor,
              up: this.state.isGoingUp ? false : state.outside[currentFloor].buttonUp,
              down: ! this.state.isGoingUp ? false : state.outside[currentFloor].buttonDown,
            });
          });
        }

        this.clearRequest('undirected', state.floor);
      });
    },

    /**
    * onCabinDoorsClosed
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsClosed: (commands) => {
      this.setState({ areDoorsOpen: false }, () => this.goToNextFloor(commands));
    },

    /**
    * onCabinDoorsOpened
    * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
    * @returns {void}
    */
    onCabinDoorsOpened: (commands) => {
      if ( this.state.moving )
        throw new Error("Doors opened while moving");

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
