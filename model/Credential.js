/**
 * A module to access credentials in the database
 */

const THE_MONG = require('mongoose')

let tmpCredSchm = new THE_MONG.Schema({
  userName: {type: String, required: true, unique: true},
  password: {type: String, maxlength: 64, required: true} // uppercase: true,
})

let Credential = THE_MONG.model('Credential', tmpCredSchm)

module.exports = Credential
