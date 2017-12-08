const THE_USER = require('../model/User')
const THE_MONG = require('mongoose')

let outRouter = require('express').Router()

outRouter.route('/')
    .get((req, resp, next) => {
      if (req.query.logout) {
        delete req.session.theUser
        resp.redirect('/')
      } else {
        resp.render('pages/login', {pageTitle: 'Login Page'})
      }
    })
    .post((req, resp, next) => {
      if (THE_MONG.connection.readyState !== 1) return next(new Error('Database not connected')) // Just to be sure
      if (req.body.username && req.body.password) {
        console.log('\nvvvvvvvvvvvvvvvvvvvvFIND')
        console.log(THE_MONG.connection.readyState)
        console.log('^^^^^^^^^^^^^^^^^^^^')
        let tmpUser // To save the user between 'then' calls
        THE_USER.findOne({userName: req.body.username}, {'__v': 0}).exec() // get user if any ('exec()' returns a promise)
          .then(theUser => {
            if (theUser) { // If there is a user, then check if password is coorect
              tmpUser = theUser // Keep it aside
              return theUser.checkPassword(req.body.password) // Returns a promise to fail the login or not
            } else {
              return false // Else, fail the login
            }
          })
          .then(isOK => {
            if (isOK) { // If OK, redirect with success message
              req.session.theUser = tmpUser // Put the user in the session
              req.session.theFlash = {type: 'msg-info', msg: 'Login successful...'}
              resp.redirect('/')
            } else { // Else, redirect to login page again with failure message
              req.session.theFlash = {type: 'msg-err', msg: 'Username or password incorrect.'}
              resp.redirect('/login')
            }
          })
          .catch(err => next(err)) // Push the error if any
      } else {
        req.session.theFlash = {type: 'msg-err', msg: 'Username and password fields must be specified.'}
        resp.redirect('/login')
      }
    })

module.exports = outRouter
