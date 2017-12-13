const THE_USER = require('../model/User')
const THE_SNIP = require('../model/Snip')
const {checkUserInput} = require('./dataCheck')

let outRouter = require('express').Router()

outRouter.route('/user') // User's root
  .get((req, resp, next) => {
    if (req.session.theUser) { // If logged-in
      THE_SNIP.find({snipUserID: req.session.theUser._id}, '_id snipTitle snipNote').exec() // Just the needed projection
        .then(theSnips => {
          resp.render('pages/user/user', {pageTitle: 'Welcome To Your Page', theSnips}) // Just display
        })
        .catch(next) // Push the error if any
    } else { // Not logged-in?? then redirect to login with flash message (changed to error)
      // req.session.theFlash = {type: 'msg-err', msg: 'You have to login or create an account.'}
      // resp.redirect('/login')
      resp.status(403).render('error/401', {theErrMsg: 'You have to login or create an account first.'})
    }
  })

outRouter.route('/user/create') // User's create route
  .get((req, resp, next) => {
    if (req.session.theUser) { // If already logged-in, then redirect to user's page with a flash message (replaced with error)
      // req.session.theFlash = {type: 'msg-err', msg: 'You already have an account.'}
      // resp.redirect('/user')
      resp.status(403).render('error/403', {theErrMsg: 'You already have an account.'})
    } else {
      resp.render('pages/user/create', {pageTitle: 'Create a User Account'}) // Just display
    }
  })
  .post(checkUserInput) // Check the user input before let it slip to database (this is the controller check)
  .post((req, resp, next) => {
    if (req.session.theUser) { // If already logged-in, then redirect to user's page with a flash message (replaced with error)
      // req.session.theFlash = {type: 'msg-err', msg: 'You already have an account.'}
      // resp.redirect('/user')
      resp.status(403).render('error/403', {theErrMsg: 'You already have an account.'})
    } else {
      THE_USER.create(req.body) // May need to change
        .then(() => { // When success, redirect to root with flash message
          req.session.theFlash = {type: 'msg-info', msg: 'Account created. Please login using new account.'}
          resp.redirect('/')
        })
        .catch(err => {
          if (err.code && err.code === 11000) { // When error and the error is duplicate, inform and back to create
            req.session.theFlash = {type: 'msg-err', msg: 'The \'User Name\' already exists.'}
            resp.redirect('/user/create')
          } else { // Else, pass the error
            next(err)
          }
        })
    }
  })

module.exports = outRouter
