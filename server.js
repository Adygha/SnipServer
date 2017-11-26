const Controller = require('./controller/CodeSnipsServer')

startUp()

function startUp () {
  let tmpControl = new Controller()
  tmpControl.startServer()
}
