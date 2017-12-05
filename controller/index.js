let outRouter = require('express').Router()
let tmpArr = new Array(50)
let tmpAnchs = [{href: '/', title: 'Home'}, {href: '/users', title: 'User Pages'}]
tmpArr.fill('http://lnu.se')
// outRouter.get('/', (req, resp, next) => resp.render('pages/home', {
outRouter.route('/').get((req, resp, next) => {
  // console.log(req.session.flash ? req.session.flash : 'There is NOOOOO flash')
  let tmpFlash
  if (req.session.flash) { // This part is to imitate flash message
    tmpFlash = req.session.flash
    delete req.session['flash']
  }
  resp.render('pages/home', {
    pageTitle: 'Welcome to Home Page',
    anArr: tmpArr,
    theHeaderAnchs: tmpAnchs,
    theFlashMsg: tmpFlash
  })
})

module.exports = outRouter
