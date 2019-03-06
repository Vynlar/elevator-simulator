import React, { Component } from 'react';
import * as R from 'ramda';
import { numFloors, second } from './Elevator';

import StandardModeController from './StandardModeController';
import EmergencyModeController from './EmergencyModeController';

const EMERGENCY_TIMEOUT = 30 * 60 * second;

export default class Controller extends Component {

  /**
   * Initial state
   * Use this.setState() to change the state.
   * Do not use assignment! e.x. this.state.foo = 'bar'; <-- this will break everything
   */
  state = {
    isEmergency: false,
    childListeners: null,

    put: 'whatever state you want here',
    itCanBeNumbers: 7,
    orEvenOtherObjects: {
      like: 'this!',
    },
    arraysAreCoolToo: [ 1, 2, 3, 4 ],
  }

  registerListeners = listeners =>
  {
    this.setState({childListeners: listeners});
  }

  listeners = (() => ({
    /**
     * onFireAlarm
     * Called once when the fire alarm is first triggered
     * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
     * @returns {void}
     */
    onFireAlarm: (commands) => {
      this.setState({isEmergency: true});
      console.log("FIRE! FIRE!")
      setTimeout((() => this.setState({isEmergency: false})), EMERGENCY_TIMEOUT);
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
      <div>
        {this.state.isEmergency ? 
          <EmergencyModeController 
            registerListeners={this.registerListeners}
          />
        :
          <StandardModeController
            registerListeners={this.registerListeners}
          />
        }
        <Shell listeners={{ ...this.state.childListeners, ...this.listeners }} />
      </div>
    );
  }
}
