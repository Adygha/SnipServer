/**
 * This module will handle the server's configs (it usually should not be pushed to git server, or
 * at least the sensitive data can be in a separate file that is not pushed to git server, but for
 * this assignment it's OK).
 */

module.exports = {
  port: 4000,
  dbURL: 'mongodb://azmat.se:50000/codeSnipsDB', // Back home (more control)
  // dbURL: 'mongodb://snipuser:qazqazqaz1@ds135916.mlab.com:35916/assign2db', // mlab
  theNavAnchs: [{href: '/', title: 'Home'}, {href: '/snips', title: 'Code Snippets'}],
  sessOption: {
    name: 'snips.server',
    secret: 'assignment 2',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 10 * 365 * 24 * 60 * 60}
  },
  minPasswordLength: 2,
  maxUsernameLength: 100,
  maxNormalFieldLength: 100, // For general fields
  maxSnipNoteLength: 255
}
