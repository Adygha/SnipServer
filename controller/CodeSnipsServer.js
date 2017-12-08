/*
 * A module that is essentially a class that represents a code-snippit-server. (Seemed more
 * appropriate to make it a controller because it handles controlling the routes)
 */

const THE_CONF = require('../conf/conf')
const THE_PATH = require('path')
const THE_EXP = require('express')
const THE_SESS = require('express-session')
const THE_ENGN = require('express-handlebars')
const THE_PARSE = require('body-parser')
const ConsoleView = require('../view/ConsoleView')
const DbConn = require('../model/DbConnection')

module.exports = class {
  /**
   * Default constructor.
   */
  constructor () {
    this._consView = new ConsoleView()                              //
    this._consView.addListener('quit', () => this.stopServer(true)) //
    this._consView.beginWatch()                                     // Hookup with server's console
    this._consView.displayWelcomeMessage()                          //

    this._dbModel = new DbConn(THE_CONF.dbURL)
    this._dbModel.addListener('error', this._errorHandler.bind(this)) // TODO: May need to remove
    this._dbModel.addListener('message', this._consView.displayMessage)

    this._svrApp = THE_EXP()
    this._svrApp.use(THE_EXP.static(THE_PATH.join(process.cwd(), 'www'))) // I put this here so that static requests don't do extra load
    this._svrApp.engine('.hbs', THE_ENGN({
      layoutsDir: THE_PATH.join(process.cwd(), 'view/layouts'),   //
      partialsDir: THE_PATH.join(process.cwd(), 'view/partials'), // Needed for changing the 'views' name (or else errors happen).
      defaultLayout: 'main',
      extname: '.hbs'
    }))
    this._svrApp.set('view engine', '.hbs')
    this._svrApp.set('views', THE_PATH.join(process.cwd(), 'view')) // Just changing the 'views' name
    this._svrApp.use(THE_PARSE.urlencoded({extended: true}))
    this._svrApp.use(THE_SESS(THE_CONF.sessOption))
    this._svrApp.use(this._flashMid) // We will need the flash messages
    this._svrApp.use(this._mixedMid) // Just to squees-in some stuff
    this._svrApp.use('/', require('./index'))
    this._svrApp.use('/login', require('./login'))
    this._svrApp.use('/user', require('./user'))
    this._svrApp.use((req, resp, next) => resp.status('404').render('error/404'))
    this._svrApp.use((err, req, resp, next) => {
      // this._consView.displayMessage('An error happened with message: ' + err.message)
      this._errorHandler(err)
      resp.status('500').render('error/500')
    })
  }

  /**
   * Starts the listening server.
   */
  startServer () {
    if (this._svr && !this._svr.listening) { // If there is already a listening server that has stopped listening then just re-listen
      this._svr.listen(THE_CONF.port, () => this._consView.displayMessage('Server re-started...'))
    } else if (!this._svr) { // If no listening server yet
      this._svr = this._svrApp.listen(THE_CONF.port, () => this._consView.displayMessage('Server started...'))
    }
  }

  /**
   * Stops the listening server temporarily or permanently.
   * @param {Boolean} isFinalStop true if we need to finalize and cleanup preparing to close server, or false to
   *                              just temporariy stop the listening server.
   */
  stopServer (isFinalStop) {
    if (this._svr.listening) this._svr.close(() => this._consView.displayMessage('Stopping server...')) // Only stop if it's listening
    if (isFinalStop) { // If preparing to close
      this._consView.removeAllListeners()
      this._consView.endWatch()
      this._dbModel.closeConnection()
    }
  }

  /**
   * A middleware to handle mixed small stuff (that are not worth making as separate).
   * @param {Object} req the incomming request to handle
   * @param {Object} resp the response to be prepared
   * @param {Function} next called to continue the chain
   */
  _mixedMid (req, resp, next) {
    if (req.session.theUser) resp.locals.theUser = req.session.theUser // Pass the user to the header
    resp.locals.theHeaderAnchs = THE_CONF.theHeaderAnchs // Pass the header links/anchors to the header
    next()
  }

  /**
   * A middleware to handle the flash messages.
   * @param {Object} req the incomming request to handle
   * @param {Object} resp the response to be prepared
   * @param {Function} next called to continue the chain
   */
  _flashMid (req, resp, next) {
    if (req.session.theFlash) {
      resp.locals.theFlash = req.session.theFlash
      delete req.session.theFlash
    }
    next()
  }

  /**
   * A general error handler.
   * @param {Error} theError the error object to be handled
   */
  _errorHandler (theError) {
    this._consView.displayMessage('An error occurred with message: [%s].', theError.message)
  }
}
