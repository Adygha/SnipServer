/*
 * A modulte that has some semi-middleware to check for inputted by user (maybe other data later).
 * The 'body-parser' middleware must be used before.
 * I call them semi-middleware (just my term) because they might be called by other semi-middleware
 * to combine their functionality (instead of calling each one by its own)
 */

const THE_MONG = require('mongoose')
const THE_ERRS = require('../libs/CustomErrors')

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
  tmpResult = generalRequestParamsCheck(req, resp, next)   //
  if (tmpResult) return next(tmpResult)                   //
  if (tmpIsChanged) delete resp.locals.isNormalFunction // Remove if changed by this function
  // let outErr
  // if (!_checkParamsValid(req.body)) { // Do a general check on the passed parameters
  //   outErr = new THE_ERRS.InvalidHttpParamError('One of the passed parameters is not acceptable.')
  //   return resp.locals.isNormalFunction ? outErr : next(outErr) // Return/pass a custom error
  // }
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
