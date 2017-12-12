/*
 * A modulte that has some middleware to check for data to be inseted to database.
 * The 'body-parser' middleware must be used before.
 */

const {InvalidHttpParamError} = require('./CustomErrors')

/**
 * Checks that the request parameters are only strings (not objects that can be injected to noSQL for example)
 * @param {Request} req the incoming request
 * @param {Response} resp the outgoing response
 * @param {Function} next the function to continue the chain
 */
function onlyStringInRequest (req, resp, next) {
  if (req.body) {
    let tmpKeys = Object.keys(req.body)
    for (let i = 0; i < tmpKeys.length; i++) { // forEach is problematic here
      if (typeof req.body[tmpKeys[i]] !== 'string') { // In case one of the parameters is not a string
        return next(new InvalidHttpParamError('One of the passed parameters is not acceptable.')) // Pass a custom error
      }
    }
  }
  next()
}

module.exports = {onlyStringInRequest}
