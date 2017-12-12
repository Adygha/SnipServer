const THE_SNIP = require('../model/Snip')
const {checkSnipInput} = require('./dataCheck')

let outRouter = require('express').Router()

outRouter.route('/')
  .get((req, resp, next) => {
    // TODO: Prepare all snips
    resp.render('pages/snips/snips', {pageTitle: 'Welcome to snippets page'}) // Just display
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
  .post(checkSnipInput)
  .post((req, resp, next) => {
    if (req.session.theUser) {
      // TODO: cCreate the snippet
      req.body.snipTags = req.body.snipTags.match(/\S+/g) || []
      req.body.snipUserID = req.session.theUser._id
      console.log('\nvvvvvvvvvvvvvvvvvvvvFIND')
      console.log(req.body)
      console.log('^^^^^^^^^^^^^^^^^^^^')
      THE_SNIP.create(req.body)
        .then(() => { // When success, redirect to snippets (may change it) with flash message
          req.session.theFlash = {type: 'msg-info', msg: 'Code snippet successfully created.'}
          resp.redirect('/snips')
        })
        .catch(err => next(err))
    } else { // If not logged-in, then redirect to snippets page with a flash message
      req.session.theFlash = {type: 'msg-err', msg: 'You must have an account to create a code snippet.'}
      resp.redirect('/snips')
    }
  })

outRouter.route('/:snipID')
  .get((req, resp, next) => {
    console.log('\nvvvvvvvvvvvvvvvvvvvvFIND')
    console.log(req.params.snipID)
    console.log('^^^^^^^^^^^^^^^^^^^^')
    // TODO: Prepare the specific snip
    resp.render('pages/snips/snip', {pageTitle: 'Snippet page'}) // Just display
  })

module.exports = outRouter
