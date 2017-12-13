let outRouter = require('express').Router()
let tmpArr = new Array(50)
tmpArr.fill('http://lnu.se')

outRouter.route('/').get((req, resp, next) => {
  resp.render('pages/home', {pageTitle: 'Welcome to Code Snippets'})
})

module.exports = outRouter
