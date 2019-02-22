export default class Controller {
  /**
   * onFloorCall
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @param {number} floor Index of the floor
   * @param {bool} up True if the request was up
   * @param {bool} down True if the request was down
   * @returns {void}
   */
  onFloorCall(commands, floor, up, down) {
  }

  /**
   * onCabinRequest
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @param {number} floor Index of the requested floor
   * @returns {void}
   */
  onCabinRequest(commands, floor) {
  }

  /**
   * onDoorOpenRequest
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @returns {void}
   */
  onDoorOpenRequest(commands) {
  }

  /**
   * onDoorCloseRequest
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @returns {void}
   */
  onDoorCloseRequest(commands) {
  }

  /**
   * onFloorArrival
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @returns {void}
   */
  onFloorArrival(commands) {
  }

  /**
   * onCabinDoorsClosed
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @returns {void}
   */
  onCabinDoorsClosed(commands) {
  }

  /**
   * onCabinDoorsOpened
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @returns {void}
   */
  onCabinDoorsOpened(commands) {
  }

  /**
   * onFloorDoorsOpened
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @param {number} floor The index of the floor whose doors opened
   * @returns {void}
   */
  onFloorDoorsOpened(commands) {
  }

  /**
   * onFloorDoorsClosed
   * @param {object} commands The object of command functions to control the elevator (see ./Elevator.js for documentation)
   * @param {number} floor The index of the floor whose doors closed
   * @returns {void}
   */
  onFloorDoorsClosed(commands) {
  }
}
