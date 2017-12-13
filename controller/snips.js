const THE_SNIP = require('../model/Snip')
const THE_USER = require('../model/User')
const {checkSnipInput} = require('./dataCheck')

let outRouter = require('express').Router()

outRouter.route('/snips')
  .get((req, resp, next) => {
    if (Object.keys(req.query).length === 0) { // If no query, then display all snips
      THE_SNIP.find({}, '_id snipTitle snipNote').exec() // Just the needed projection
        .then(theSnips => {
          resp.render('pages/snips/snips', {pageTitle: 'Welcome To Code Snippets Page', theSnips}) // Just display
        })
        .catch(next) // Push the error if any
    } else { // Else, there is a search query
      resp.status(404).render('error/404') // Display this for now
    }
  })

outRouter.route('/snips/create')
  .get((req, resp, next) => {
    if (req.session.theUser) {
      resp.render('pages/snips/create', {pageTitle: 'Create a Code Snippet'}) // Just display
    } else { // If not logged-in, then redirect to snippets page with a flash message (changed to error)
      // req.session.theFlash = {type: 'msg-err', msg: 'You must have an account to create a code snippet.'}
      // resp.redirect('/snips')
      resp.status(401).render('error/401', {theErrMsg: 'You must have an account to create a code snippet.'})
    }
  })
  .post(checkSnipInput) // Check the user input before let it slip to database (this is the controller check)
  .post((req, resp, next) => {
    if (req.session.theUser) {
      req.body.snipTags = req.body.snipTags.match(/\S+/g) || []
      req.body.snipUserID = req.session.theUser._id
      let tmpSnip // To pass the snip between 'then' callss
      THE_SNIP.create(req.body)
        .then(theSnip => {
          tmpSnip = theSnip
          return THE_USER.findByIdAndUpdate(req.session.theUser._id, {$push: {userSnips: theSnip._id}}).exec() // Update the snips specifically
        })
        .then(updatedUser => { // When success to this point, redirect to snippet with flash message
          req.session.theFlash = {type: 'msg-info', msg: 'Code snippet successfully created.'}
          resp.redirect('/snips/' + tmpSnip._id)
        })
        .catch(next)
    } else { // If not logged-in, then redirect to snippets page with a flash message (changed to error page)
      // req.session.theFlash = {type: 'msg-err', msg: 'You must have an account to create a code snippet.'}
      // resp.redirect('/snips')
      resp.status(401).render('error/401', {theErrMsg: 'You must have an account to create a code snippet.'})
    }
  })

outRouter.route('/snips/:snipID')
  .get((req, resp, next) => {
    THE_SNIP.findById(req.params.snipID, {'__v': 0}).populate('snipUserID').exec()
      .then(theSnip => {
        if (theSnip) {
          resp.render('pages/snips/snip', { // Just display
            pageTitle: 'Snippet page',
            theSnip,
            thePreventEdit: !req.session.theUser || !theSnip.snipUserID._id.equals(req.session.theUser._id) // To check if current user can edit snippet
          })
        } else {
          resp.status(404).render('error/404')
        }
      })
      .catch(next) // Push the error if any
  })

outRouter.route('/snips/edit/:snipID')
  .post((req, resp, next) => {
    let tmpSnip // To pass it
    THE_SNIP.findById(req.params.snipID, {'__v': 0}).populate('snipUserID').exec()
      .then(theSnip => {
        tmpSnip = theSnip
        if (!theSnip) { // If there is no such snippet
          return null
        } else if (req.session.theUser && theSnip.snipUserID._id.equals(req.session.theUser._id)) { // Check if the post really came from registered user that wrote the snip
          theSnip.snipTitle = req.body.snipTitle
          theSnip.snipTags = req.body.snipTags.match(/\S+/g) || []
          theSnip.snipNote = req.body.snipNote
          theSnip.snipCode = req.body.snipCode
          return theSnip.save()
        } else {
          return null
        }
      })
      .then(updatedSnip => {
        if (updatedSnip) {
          req.session.theFlash = {type: 'msg-info', msg: 'Code snippet successfully updated.'}
          resp.redirect('/snips/' + req.params.snipID)
        } else if (!tmpSnip) { // If there is no such snippet
          resp.status(404).render('error/404')
        } else { // In this case null was returned in the previous 'then' and user not allowed to edit (changed to error page)
          // req.session.theFlash = {type: 'msg-err', msg: 'You cannot edit other people\'s code snippets.'}
          // resp.redirect('/snips/' + req.params.snipID)
          resp.status(403).render('error/403', {theErrMsg: 'You cannot edit other people\'s code snippets.'})
        }
      })
      .catch(next) // Push the error if any
  })

outRouter.route('/snips/delete/:snipID')
  .post((req, resp, next) => {
    let tmpSnip // To pass it
    THE_SNIP.findById(req.params.snipID, {'__v': 0}).populate('snipUserID').exec()
      .then(theSnip => {
        tmpSnip = theSnip
        if (!theSnip) { // If there is no such snippet
          return null
        } else if (req.session.theUser && theSnip.snipUserID._id.equals(req.session.theUser._id)) { // Check if the post really came from registered user that wrote the snip
          return THE_SNIP.findByIdAndRemove(theSnip._id).exec()
        } else { // Left with forbidden (return null for now)
          return null
        }
      })
      .then(deletedSnip => { // After deleting the snip, delete the reference in user
        if (deletedSnip) { // If success delete
          return THE_USER.findByIdAndUpdate(req.session.theUser._id, {$pull: {userSnips: deletedSnip._id}}).exec() // Update the snips specifically
        } else {
          return null
        }
      })
      .then(updatedUser => {
        if (updatedUser) { // Updated successfully
          req.session.theFlash = {type: 'msg-info', msg: 'Code snippet successfully deleted.'}
          resp.redirect('/snips')
        } else if (!tmpSnip) { // The specified snippet does not exist
          resp.status(404).render('error/404')
        } else { // In this case null was returned in the previous 'then' and user not allowed to delete (changed to error page)
          // req.session.theFlash = {type: 'msg-err', msg: 'You cannot delete other people\'s code snippets.'}
          // resp.redirect('/snips/' + req.params.snipID)
          resp.status(403).render('error/403', {theErrMsg: 'You cannot delete other people\'s code snippets.'})
        }
      })
      .catch(next) // Push the error if any
  })

module.exports = outRouter
