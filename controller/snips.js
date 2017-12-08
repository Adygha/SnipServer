let outRouter = require('express').Router()

outRouter.route('/')
  .get((req, resp, next) => {
    // TODO: Display all code snippits
  })

outRouter.route('/create')
  .get((req, resp, next) => {
    // TODO: Create snippit page
  })
  .post((req, resp, next) => {
    // TODO: Handle new snippits creation
  })

module.exports = outRouter
