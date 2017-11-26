const THE_EMIT = require('events')
const THE_QUIT_EV = 'quit'
const THE_QUIT_COMMAND = 'q'
const THE_WAIT_LINE = 'Waiting for input: '

module.exports = class extends THE_EMIT {
  /**
   * Displays the initial welcome message with some initial help.
   */
  displayWelcomeMessage () {
    // console.log('Welcome. Enter \'%s\' to quit the app.\n', THE_QUIT_COMMAND)
    this.displayMessage('Welcome. Enter \'%s\' to quit the app.', THE_QUIT_COMMAND)
  }

  /**
   * Displays a message line, and handles 'printf' like formattings exactly like 'console.log'
   * @param {any} theMessage the message to be displayed
   * @param {any} optionals some other optional parameters to display
   */
  displayMessage (theMessage, ...theOptionals) {
    process.stdout.clearLine()  // Those two lines are just to remove 'Waiting for input:' when new message comes
    process.stdout.cursorTo(0)  //
    console.log(theMessage, ...theOptionals)
    if (!process.stdin.isPaused()) process.stdout.write(THE_WAIT_LINE)
  }

  /**
   * Starts watching the console input.
   */
  beginWatch () {
    process.once('SIGINT', () => this.emit(THE_QUIT_EV)) // To handle finishing-up when interrupted
    process.stdin.resume().addListener('data', buf => {
      let tmpStr = buf.toString().trim()
      if (tmpStr === THE_QUIT_COMMAND) {
        this.emit(THE_QUIT_EV)
      } else {
        process.stdout.write('Invalid input.\n' + THE_WAIT_LINE)
      }
    })
  }

  /**
   * Stops watching the console input.
   */
  endWatch () {
    process.stdin.removeAllListeners('data').pause()
  }
}
