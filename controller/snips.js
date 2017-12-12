const THE_SNIP = require('../model/Snip')
const THE_MONG = require('mongoose')
const {DatabaseNotAvailableError} = require('../libs/CustomErrors')

let outRouter = require('express').Router()

outRouter.route('/')
  .get((req, resp, next) => {
    // TODO: Prepare all snips
    resp.render('pages/snips/snips', {pageTitle: 'Welcome to snippets page'}) // Just display
  })

outRouter.route('/:snipID')
  .get((req, resp, next) => {
    console.log('\nvvvvvvvvvvvvvvvvvvvvFIND')
    console.log(req.params.snipID)
    console.log('^^^^^^^^^^^^^^^^^^^^')
    // TODO: Prepare the specific snip
    resp.render('pages/snips/snip', {pageTitle: 'Snippet page'}) // Just display
  })

outRouter.route('/create')
  .get((req, resp, next) => {
    if (req.session.theUser) {
      resp.render('pages/snips/create', {pageTitle: 'Create a Code Snippet'}) // Just display
    } else { // If not logged-in, then redirect to snippets page with a flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You must have an account to create a code snippet.'}
      resp.redirect('/snips')
    }
  })
  .post((req, resp, next) => {
    if (THE_MONG.connection.readyState !== 1) { // Check if connected to DB
      return next(new DatabaseNotAvailableError('The database is not available right now. Please try again later.'))
    }
    if (req.session.theUser) {
      // TODO: cCreate the snippet
    } else { // If not logged-in, then redirect to snippets page with a flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You must have an account to create a code snippet.'}
      resp.redirect('/snips')
    }
  })

module.exports = outRouter
