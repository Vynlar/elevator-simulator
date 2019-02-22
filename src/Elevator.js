import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import Controller from './Controller';

const numFloors = 5;
const second = 500;

class Elevator extends Component {
  static propTypes = {
    controller: PropTypes.instanceOf(Controller),
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
     * @arg {number} floor The index of the floor to go to
     * @returns {void}
     */
    goToFloor (floor) {
      console.log(`Going to floor ${floor}`);
      setTimeout(() => {
        console.log(`Arrived at floor ${floor}`);
        this.props.controller.onFloorArrival();
        self.setState({
          floor
        });
      }, second * Math.abs(floor - self.state.floor) * 2)
    },
    /**
     * openCabinDoors
     */
    openCabinDoors() {
      console.log('Opening cabin doors');
      setTimeout(() => {
        console.log('Cabin doors opened');
        this.props.controller.onCabinDoorsOpened();
        self.setState(R.assocPath(['cabin', 'doorsOpen'], true));
      }, second * 1)
    },
    /**
     * closeCabinDoors
     */
    closeCabinDoors() {
      console.log('Closing cabin doors');
      setTimeout(() => {
        console.log('Cabin doors closed');
        this.props.controller.onCabinDoorsClosed();
        self.setState(R.assocPath(['cabin', 'doorsOpen'], false));
      }, second * 1)
    },
    /**
     * openFloorDoors
     * @param {number} floor The index of the floor whose doors you wish to open
     */
    openFloorDoors(floor) {
      console.log(`Opening floor doors on floor ${floor}`);
      setTimeout(() => {
        console.log(`Floor doors on floor ${floor} opened`);
        this.props.controller.onFloorDoorsOpened(floor);
        self.setState(R.assocPath(['outside', floor, 'doorsOpen'], true));
      }, second * 1)
    },
    /**
     * closeFloorDoors
     * @param {number} floor The index of the floor whose doors you wish to open
     */
    closeFloorDoors(floor) {
      console.log(`Closing floor doors on floor ${floor}`);
      setTimeout(() => {
        console.log(`Floor doors on floor ${floor} closed`);
        this.props.controller.onFloorDoorsClosed(floor);
        self.setState(R.assocPath(['outside', floor, 'doorsOpen'], false));
      }, second * 1)
    },
    /**
     * setOutsideFloorIndicator
     * @param {number} floor The index of the floor whose indicator you wish to set
     * @param {number} value The number you wish to display
     */
    setOutsideFloorIndicator(floor, value) {
      console.log(`Setting indivator on floor ${floor} to ${value}`);
      self.setState(R.assocPath(['outside', floor, 'floor'], value));
    },
    /**
     * setCabinFloorIndicator
     * @param {number} value The number you wish to display
     */
    setCabinFloorIndicator(value) {
      console.log(`Setting cabin floor indivator to ${value}`);
      self.setState(R.assocPath(['cabin', 'floor'], value));
    },
    /**
     * setCabinDirectionIndicator
     * @param {bool} up Whether or not the up indicator is illuminated
     * @param {bool} down Whether or not the down indicator is illuminated
     */
    setCabinDirectionIndicator(up, down) {
      console.log(`Setting cabin direction indicator to (up: ${up}, down: ${down})`);
      self.setState(
        R.pipe(
          R.assocPath(['cabin', 'up'], up),
          R.assocPath(['cabin', 'down'], down),
        )
      );
    },
    /**
     * setOutsideDirectionIndicator
     * @param {number} floor The index of the floor whose indicator you wish to set
     * @param {bool} up Whether or not the up indicator is illuminated
     * @param {bool} down Whether or not the down indicator is illuminated
     */
    setOutsideDirectionIndicator(floor, up, down) {
      console.log(`Setting outside direction indicator of floor ${floor} to (up: ${up}, down: ${down})`);
      self.setState(
        R.pipe(
          R.assocPath(['outside', floor, 'up'], up),
          R.assocPath(['outside', floor, 'down'], down),
        )
      );
    },
    /**
     * setOutsideButtonLights
     * @param {number} floor The index of the floor whose button lights you wish to set
     * @param {bool} up Whether or not the up button is illuminated
     * @param {bool} down Whether or not the down button is illuminated
     */
    setOutsideButtonLights(floor, up, down) {
      console.log(`Setting outside button lights of floor ${floor} to (up: ${up}, down: ${down})`);
      self.setState(
        R.pipe(
          R.assocPath(['outside', floor, 'buttonUp'], up),
          R.assocPath(['outside', floor, 'buttonDown'], down),
        )
      );
    },
    /**
     * setCabinRequestButtonLight
     * @param {number} floor The index of the floor whose button light you wish to illuminate
     * @param {bool} value Illuminated if true
     */
    setCabinRequestButtonLight(floor, value) {
      console.log(`Setting cabin request button light for floor ${floor} to ${value}`);
      self.setState(R.assocPath(['cabin', 'buttons', floor, 'lightOn'], value),);
    },
  }))(this)

  render() {
    return (
      <div>
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
              <button onClick={() => this.commands.goToFloor(3)}>Go To Floor 3</button>
              <button onClick={this.commands.openCabinDoors}>Open cabin doors</button>
              <button onClick={this.commands.closeCabinDoors}>Close cabin doors</button>
          </div>
      </div>
    );
  }
}

export default Elevator;
