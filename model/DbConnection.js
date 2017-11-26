/*
 * A module that is essentially a class to handle opening and closing a connection to MongoDB database.
 */

const THE_EMIT = require('events')
const THE_MSG_EV = 'message'

module.exports = class extends THE_EMIT {
  /**
   * Default constructor that takes the connection string URL as an argument.
   * @param {String} connURL the MongoDB connection string URL
   */
  constructor (connURL) {
    super()
    if (!connURL || typeof connURL !== 'string') throw new Error('A connection string URL for the MongoDB database must be provided.')
    // this._connURL = connURL
    this._mong = require('mongoose')

    this._mong.Promise = global.Promise // Recommended: http://mongoosejs.com/docs/promises.html
    // this._connDB = this._mong.createConnection(connURL, {promiseLibrary: global.Promise})
    // this._connDB.addListener('error', err => this.emit('error', err))

    this._connDB = this._mong.connection
    this._connDB.once('open', something => this.emit(THE_MSG_EV, 'Connection to database is open...')) // Might put it in 'then' after 2 lines
    this._mong.connect(connURL, {promiseLibrary: global.Promise, useMongoClient: true})
              .then(() => this._connDB.addListener('error', err => this.emit('error', err)))
              .catch(err => this.emit('error', err))
  }

  closeConnection () {
    if (this._connDB.db) { // If there was a Db instance that can be closed
      this._connDB.db.close(true) // Force the close if possible
                    .then(() => this._connDB.close())       //
                    .then(() => this._mong.disconnect())    // Maybe over-doing it (by disconnecting everything), but just in case
                    .catch(err => this.emit('error', err))  //
    }
  }
}
