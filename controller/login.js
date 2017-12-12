const THE_USER = require('../model/User')
const THE_MONG = require('mongoose')
const THE_CHK = require('../libs/dataCheck')
const {DatabaseNotAvailableError} = require('../libs/CustomErrors')

let outRouter = require('express').Router()

outRouter.route('/')
  .get((req, resp, next) => {
    if (req.query.logout) { // If it's a logout request, then delete the user object fom session and redirect
      delete req.session.theUser
      req.session.theFlash = {type: 'msg-info', msg: 'Logged-out succefully.'}
      resp.redirect('/')
    } else if (req.session.theUser) { // If already logged-in, then redirect to site root with flash message
      req.session.theFlash = {type: 'msg-info', msg: 'You are already logged-in.'}
      resp.redirect('/')
    } else { // If it's normal visit, just display login page
      resp.render('pages/login', {pageTitle: 'Login Page'})
    }
  })
  .post(THE_CHK.onlyStringInRequest)
  .post((req, resp, next) => {
    if (THE_MONG.connection.readyState !== 1) { // Check if connected to DB
      return next(new DatabaseNotAvailableError('The database is not available right now. Please try again later.'))
    }
    if (req.body.username && req.body.password) {
      let tmpUser // To save the user between 'then' calls
      THE_USER.findOne({userName: req.body.username}, {'__v': 0}).exec() // get user if any ('exec()' returns an ES6 promise)
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
