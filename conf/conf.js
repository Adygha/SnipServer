/**
 * This module will handle the server's configs (it usually should not be pushed to git server, or
 * at least the sensitive data can be in a separate file that is not pushed to git server, but for
 * this assignment it's OK).
 */

module.exports = {
  port: 4000,
  dbURL: 'mongodb://azmat.se:50000/codeSnipsDB',
  sessOption: {
    name: 'snips.server',
    resave: false,
    secret: 'assignment 2',
    saveUninitialized: false // ,
    // cookie: { secure: true }
  }
}
