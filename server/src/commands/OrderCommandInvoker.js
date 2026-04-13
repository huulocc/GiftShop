/**
 * OrderCommandInvoker - Command Pattern
 *
 * The Invoker stores and executes commands.
 * Maintains a history of executed commands for potential undo operations.
 * Decouples the object that invokes the operation from the one that performs it.
 */
class OrderCommandInvoker {
  constructor() {
    this.history = []
  }

  /**
   * Execute a command and store it in history
   * @param {Command} command - The command to execute
   * @returns {Promise<Object>} result of command execution
   */
  async executeCommand(command) {
    const result = await command.execute()
    this.history.push(command)
    return result
  }

  /**
   * Undo the last executed command
   * @returns {Promise<Object|null>} result of undo, or null if no history
   */
  async undoLastCommand() {
    const command = this.history.pop()
    if (command) {
      return command.undo()
    }
    return null
  }

  /**
   * Get the command history
   * @returns {Array} list of executed commands
   */
  getHistory() {
    return this.history
  }
}

module.exports = new OrderCommandInvoker()
