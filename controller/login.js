const THE_USER = require('../model/User')
const THE_CONF = require('../conf/conf')
const {checkLoginInput} = require('./dataCheck')

let outRouter = require('express').Router()

outRouter.route('/login')
  .get((req, resp, next) => {
    if (req.query.logout) { // If it's a logout request, then delete the user object fom session and redirect
      delete req.session.theUser // Just in case
      req.session.regenerate(err => { // Used regenerate and not destroy so that we can pass the flash message
        if (err) return next(err) // Will continue after this safely
        resp.clearCookie(THE_CONF.sessOption.name) // It helps too
        req.session.theFlash = {type: 'msg-info', msg: 'Logged-out succefully.'}
        resp.redirect('/')
      })
    } else if (req.session.theUser) { // If already logged-in, then redirect to site root with flash message
      req.session.theFlash = {type: 'msg-info', msg: 'You are already logged-in.'}
      resp.redirect('/')
    } else { // If it's normal visit, just display login page
      resp.render('pages/login', {pageTitle: 'Login Page'})
    }
  })
  .post(checkLoginInput) // Check the user input before let it slip to database (this is the controller check)
  .post((req, resp, next) => {
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
            req.session.regenerate(err => { // Better to regenerate after login
              if (err) return next(err)
              req.session.theUser = tmpUser // Put the user in the session
              req.session.theFlash = {type: 'msg-info', msg: 'Login successful...'}
              resp.redirect('/')
            })
          } else { // Else, redirect to login page again with failure message (changed to error page according to lecture video)
            // req.session.theFlash = {type: 'msg-err', msg: 'Username or password incorrect.'}
            // resp.redirect('/login')
            resp.status(401).render('error/401', {theErrMsg: 'Username or password incorrect.'})
          }
        })
        .catch(next) // Push the error if any
    } else {
      req.session.theFlash = {type: 'msg-err', msg: 'Username and password fields must be specified.'}
      resp.redirect('/login')
    }
  })

module.exports = outRouter
