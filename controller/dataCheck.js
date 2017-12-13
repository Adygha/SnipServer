/*
 * A modulte that has some semi-middleware to check for inputted by user (maybe other data later).
 * The 'body-parser' middleware must be used before.
 * I call them semi-middleware (just my term) because they might be called by other semi-middleware
 * to combine their functionality (instead of calling each one by its own)
 */

const THE_MONG = require('mongoose')
const THE_ERRS = require('../libs/CustomErrors')
const THE_CONF = require('../conf/conf')

/**
 * A helper function to avoid code duplication. It redirects to specified URL with an error flash message.
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {String} theMsg the message to display as an error flash message
 * @param {String} theURL the URL to redirect to
 */
function _redirectWithErrMessage (req, resp, theMsg, theURL) {
  req.session.theFlash = {type: 'msg-err', msg: theMsg}
  resp.redirect(theURL)
}

/**
 * Checks the input for the user create (maybe update later).
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function checkUserInput (req, resp, next) {
  let tmpIsChanged = false // To specify if 'resp.locals.isNormalFunction' has changed
  if (!resp.locals.isNormalFunction) {
    resp.locals.isNormalFunction = true // To tell the next middleware that they are called as normal functions
    tmpIsChanged = true
  }
  let tmpResult = checkDatabaseAvailable(req, resp, next) //
  if (tmpResult) return next(tmpResult)                   // Call other checks as normal functions and check if they return errors
  tmpResult = generalRequestParamsCheck(req, resp, next)  //
  if (tmpResult) return next(tmpResult)                   //
  if (tmpIsChanged) delete resp.locals.isNormalFunction // Remove if changed by this function
  // Here comes the login specific check (previous checks will result in an error and error page while the
  // following will just display a message to the user)
  if (!req.body.userName || /\s+/g.test(req.body.userName)) { // Prevent empty or white-space username
    return _redirectWithErrMessage(req, resp, '\'User Name\' field cannot be empty or contain any white-space.', req.url)
  }
  req.body.userName = req.body.userName.toLowerCase() // Usernames should be lower case
  if (req.body.userName.length > THE_CONF.maxUsernameLength) { // Prevent long usernames
    return _redirectWithErrMessage(req, resp, '\'User Name\' too long. Maximum length is ' + THE_CONF.maxUsernameLength + ' letters.', req.url)
  }
  if (!req.body.passwordHash || req.body.passwordHash.length < THE_CONF.minPasswordLength) { // Prevent empty or short passwords
    return _redirectWithErrMessage(req, resp, 'Password cannot be empty or shrter than ' + THE_CONF.minPasswordLength + ' letters.', req.url)
  }
  if ((req.body.firstName && req.body.firstName.length > THE_CONF.maxNormalFieldLength) ||
        (req.body.lastName && req.body.lastName.length > THE_CONF.maxNormalFieldLength)) { // Prevent long first/last name
    return _redirectWithErrMessage(req, resp, 'First/last name length cannot exceed ' + THE_CONF.maxNormalFieldLength + ' letters.', req.url)
  }
  if (!resp.locals.isNormalFunction) next() // If it is called as middleware then call next
}

/**
 * Checks the input for the snip create (maybe update later).
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function checkSnipInput (req, resp, next) {
  let tmpIsChanged = false // To specify if 'resp.locals.isNormalFunction' has changed
  if (!resp.locals.isNormalFunction) {
    resp.locals.isNormalFunction = true // To tell the next middleware that they are called as normal functions
    tmpIsChanged = true
  }
  let tmpResult = checkDatabaseAvailable(req, resp, next) //
  if (tmpResult) return next(tmpResult)                   // Call other checks as normal functions and check if they return errors
  tmpResult = generalRequestParamsCheck(req, resp, next)   //
  if (tmpResult) return next(tmpResult)                   //
  if (tmpIsChanged) delete resp.locals.isNormalFunction // Remove if changed by this function
  // Here comes the login specific check (previous checks will result in an error and error page while the
  // following will just display a message to the user)
  if (req.body.snipTitle && req.body.snipTitle.length > THE_CONF.maxNormalFieldLength) { // Prevent empty or long snip-title
    return _redirectWithErrMessage(req, resp, 'Snippet title\'s length cannot exceed ' + THE_CONF.maxNormalFieldLength + ' letters.', req.url)
  }
  if (req.body.snipNote && req.body.snipNote.length > THE_CONF.maxSnipNoteLength) { // Prevent empty or white-space snip-note
    return _redirectWithErrMessage(req, resp, 'Snippet note\'s length cannot exceed ' + THE_CONF.maxSnipNoteLength + ' letters.', req.url)
  }
  if (!resp.locals.isNormalFunction) next() // If it is called as middleware then call next
}

/**
 * Checks the input for the login.
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function checkLoginInput (req, resp, next) {
  let tmpIsChanged = false // To specify if 'resp.locals.isNormalFunction' has changed
  if (!resp.locals.isNormalFunction) {
    resp.locals.isNormalFunction = true // To tell the next middleware that they are called as normal functions
    tmpIsChanged = true
  }
  let tmpResult = checkDatabaseAvailable(req, resp, next) //
  if (tmpResult) return next(tmpResult)                   // Call other checks as normal functions and check if they return errors
  tmpResult = generalRequestParamsCheck(req, resp, next)   //
  if (tmpResult) return next(tmpResult)                   //
  if (tmpIsChanged) delete resp.locals.isNormalFunction // Remove if changed by this function
  // Here comes the login specific check (previous checks will result in an error and error page while the
  // following will just display a message to the user)
  if (!req.body.username || /\s+/g.test(req.body.username)) { // Prevent empty or white-space username
    return _redirectWithErrMessage(req, resp, '\'User Name\' field cannot be empty or contain any white-space.', '/login')
  }
  req.body.username = req.body.username.toLowerCase() // Usernames should be lower case
  if (req.body.username.length > THE_CONF.maxUsernameLength) { // Prevent long usernames
    return _redirectWithErrMessage(req, resp, '\'User Name\' too long. Maximum length is ' + THE_CONF.maxUsernameLength + ' letters.', '/login')
  }
  if (!resp.locals.isNormalFunction) next() // If it is called as middleware then call next
}

/**
 * Checks if database connection is available.
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function checkDatabaseAvailable (req, resp, next) {
  if (THE_MONG.connection.readyState !== 1) { // Check if connected to DB
    let outErr = new THE_ERRS.DatabaseNotAvailableError('The database is not available right now. Please try again later.')
    return resp.locals.isNormalFunction ? outErr : next(outErr) // Return/pass a custom error
  }
  if (!resp.locals.isNormalFunction) next() // If it is called as middleware then call next
}

/**
 * Checks that the request parameters dont have '$' character at beginning of phrase. Additionally, checks
 * that the request parameters are only strings (not malicious objects that can be injected to noSQL for
 * example). This type of check (that no abject us passed) is recommended by some sites but when tested
 * it, it seems the express middleware already handles this (with or without json middleware. PS: didn't
 * test arrays though).
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function generalRequestParamsCheck (req, resp, next) {
  if (req.body) {
    let tmpKeys = Object.keys(req.body)
    for (let i = 0; i < tmpKeys.length; i++) { // forEach is problematic here
      if (/^\$/.test(req.body[tmpKeys[i]]) || typeof req.body[tmpKeys[i]] !== 'string') { // In case one of the parameters is not a string (added the $ checklater)
        let outErr = new THE_ERRS.InvalidHttpParamError('One of the passed parameters is not acceptable.')
        return resp.locals.isNormalFunction ? outErr : next(outErr) // Return/pass a custom error
      }
    }
  }
  if (!resp.locals.isNormalFunction) next() // If it is called as middleware then call next
}

module.exports = {
  generalRequestParamsCheck,
  checkDatabaseAvailable,
  checkLoginInput,
  checkSnipInput,
  checkUserInput
}
