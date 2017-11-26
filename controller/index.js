module.exports = function (theWelcomeMsg) {
  let outRouter = require('express').Router()
  let tmpArr = new Array(50)
  let tmpAnchs = [{href: '/', title: 'Home'}, {href: '/users', title: 'User Pages'}]
  tmpArr.fill('http://lnu.se')
  outRouter.get('/', (req, resp, next) => resp.render('pages/home', {
    pageTitle: theWelcomeMsg,
    anArr: tmpArr,
    theHeaderAnchs: tmpAnchs
  }))
  return outRouter
}
