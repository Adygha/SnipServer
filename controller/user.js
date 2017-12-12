const THE_USER = require('../model/User')
const {checkUserInput} = require('./dataCheck')

let outRouter = require('express').Router()

outRouter.route('/') // User's root
  .get((req, resp, next) => {
    if (req.session.theUser) { // If logged-in
      resp.render('pages/user/user', {pageTitle: 'Welcome to your page'}) // Just display
    } else { // Not logged-in?? then redirect to login with flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You have to login or create an account.'}
      resp.redirect('/login')
    }
  })

outRouter.route('/create') // User's create route
  .get((req, resp, next) => {
    if (req.session.theUser) { // If already logged-in, then redirect to user's page with a flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You already have an account.'}
      resp.redirect('/user')
    } else {
      resp.render('pages/user/create', {pageTitle: 'Create a User Account'}) // Just display
    }
  })
  .post(checkUserInput)
  .post((req, resp, next) => {
    if (req.session.theUser) { // If already logged-in, then redirect to user's page with a flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You already have an account.'}
      resp.redirect('/user')
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
