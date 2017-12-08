let outRouter = require('express').Router()

outRouter.route('/')
  .get((req, resp, next) => {
    if (req.session.theUser) {
      // TODO: Display user's data
    } else {
      resp.redirect('/login')
    }
  })

outRouter.route('/create')
  .get((req, resp, next) => {
    if (req.session.theUser) {
      // TODO: Inform that already logged-in
    } else {
      // TODO: Create user page
    }
  })
  .post((req, resp, next) => {
    // TODO: Handle new user creation
  })

module.exports = outRouter
