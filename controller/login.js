let outRouter = require('express').Router()
outRouter.route('/')
.get((req, resp, next) => {
  if (req.query.logout) {
    delete req.session.theCreds
    resp.redirect('/')
  } else {
    resp.render('pages/login', {pageTitle: 'Login Page'})
  }
})
.post((req, resp, next) => {
  if (req.body.username === 'qq' && req.body.password === 'qq') {
    req.session.theFlash = {type: 'msg-info', msg: 'Login successful...'}
    req.session.theCreds = {username: req.body.username, password: req.body.password}
    resp.redirect('/')
  } else {
    resp.locals.theFlash = {type: 'msg-err', msg: 'Username or password incorrect.'} // Kind of flash on the same response
    resp.render('pages/login', {
      pageTitle: 'Login Page'
    })
  }
})

module.exports = outRouter
