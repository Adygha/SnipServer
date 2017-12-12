/*
 * A module to access code snippets.
 */

const THE_MONG = require('mongoose')

THE_MONG.Promise = global.Promise // To use ES6 Promises with mongoose (and helps respecting the 'unique' for some reason)

let tmpSnipSchm = new THE_MONG.Schema({
  snipUserID: {type: THE_MONG.Schema.Types.ObjectId, ref: 'User'},
  snipTags: [String],
  snipNote: String,
  snipCode: String
})

let Snip = THE_MONG.model('Snip', tmpSnipSchm, 'Snip') // Enforcing the name
module.exports = Snip
