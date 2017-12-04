module.exports = function (theTitle) {
  let outRouter = require('express').Router()
  let tmpArr = new Array(50)
  let tmpAnchs = [{href: '/', title: 'Home'}, {href: '/users', title: 'User Pages'}]
  tmpArr.fill('http://lnu.se')
  // outRouter.get('/', (req, resp, next) => resp.render('pages/home', {
  outRouter.route('/').get((req, resp, next) => resp.render('pages/home', {
    pageTitle: theTitle,
    anArr: tmpArr,
    theHeaderAnchs: tmpAnchs
  }))
  return outRouter // return the router (which is a function that is required)
}
