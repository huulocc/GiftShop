/**
 * Command Interface (Abstract Base)
 *
 * All order commands must implement execute() and undo().
 * Part of the Command pattern implementation.
 */
class Command {
  /**
   * Execute the command
   * @returns {Object} result of the command execution
   */
  execute() {
    throw new Error('execute() must be implemented by subclass')
  }

  /**
   * Undo the command (reverse the action)
   * @returns {Object} result of the undo operation
   */
  undo() {
    throw new Error('undo() must be implemented by subclass')
  }
}

module.exports = Command
