module.exports = function (theTitle) {
  let outRouter = require('express').Router()
  let tmpAnchs = [{href: '/', title: 'Home'}, {href: '/users', title: 'User Pages'}]
  // outRouter.get('/', (req, resp, next) => resp.render('pages/home', {
  outRouter.route('/').get((req, resp, next) => resp.render('pages/login', {pageTitle: theTitle}))
  return outRouter // return the router (which is a function that is required)
}
