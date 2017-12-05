let outRouter = require('express').Router()
let tmpAnchs = [{href: '/', title: 'Home'}, {href: '/users', title: 'User Pages'}]
// outRouter.get('/', (req, resp, next) => resp.render('pages/home', {
outRouter.route('/')
.get((req, resp, next) => resp.render('pages/login', {pageTitle: 'Login Page', theHeaderAnchs: tmpAnchs}))
.post((req, resp, next) => {
  if (req.body.username === 'qq' && req.body.password === 'qq') {
    req.session.flash = {type: 'msg-info', msg: 'Login successful...'} // This part is to imitate flash message
    resp.redirect('/')
  } else {
    resp.render('pages/login', {
      pageTitle: 'Login Page',
      theHeaderAnchs: tmpAnchs,
      theFlashMsg: {type: 'msg-err', msg: 'Username or password incorrect.'}
    })
  }
})

module.exports = outRouter
