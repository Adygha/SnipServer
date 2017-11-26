const THE_EMIT = require('events')
const THE_MSG_EV = 'message'

module.exports = class extends THE_EMIT {
  constructor (connURL) {
    super()
    this._connURL = connURL
    this._mong = require('mongoose')

    this._mong.Promise = global.Promise // Recommended: http://mongoosejs.com/docs/promises.html
    // this._connDB = this._mong.createConnection(connURL, {promiseLibrary: global.Promise})
    // this._connDB.addListener('error', err => this.emit('error', err))

    this._connDB = this._mong.connection
    this._connDB.once('open', something => this.emit(THE_MSG_EV, 'Connection to database is open...')) // Might put it in 'then' after 2 lines
    this._mong.connect(this._connURL, {promiseLibrary: global.Promise, useMongoClient: true})
              .then(() => this._connDB.addListener('error', err => this.emit('error', err)))
              .catch(err => this.emit('error', err))
  }

  stopConnection () {
    if (this._connDB.db) {
      this._connDB.db.close(true)
                    .then(() => this._connDB.close())
                    .then(() => this._mong.disconnect())
                    .catch(err => this.emit('error', err))
    }
  }
}
