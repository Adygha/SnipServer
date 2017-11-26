const ConsoleView = require('../view/ConsoleView')

module.exports = class {
  constructor () {
    this._consView = new ConsoleView()
    this._consView.addListener('quit', this.end.bind(this))
    this._consView.beginWatch()
    this._consView.displayWelcomeMessage()
  }
}
