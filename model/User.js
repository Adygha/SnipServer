/*
 * A module to access credentials in the database.
 */

const THE_MONG = require('mongoose')
const THE_CRYPT = require('bcrypt-nodejs')

THE_MONG.Promise = global.Promise // To use ES6 Promises with mongoose (and helps respecting the 'unique' for some reason)

let tmpUserSchm = new THE_MONG.Schema({
  userName: {type: String, lowercase: true, trim: true, required: true, unique: true},
  passwordHash: {type: String, maxlength: 64, required: true},
  firstName: String,
  lastName: String,
  userSnips: [{type: THE_MONG.Schema.Types.ObjectId, lowercase: true, trim: true, ref: 'Snip'}]
}, {timestamps: true}) // I might need this

tmpUserSchm.pre('save', function (next) { // To hash before saving (same as in lecture video)
  THE_CRYPT.genSalt(10, (saltErr, theSalt) => {
    if (saltErr) return next(saltErr)
    // Next, since bcrypt only uses the first 72 bytes to hash, I thought it might be good
    // to first hash the password with SHA??? for example to avoid the situation when using
    // passwords longer than 72. Then thought that it does not matter since when matching,
    // the matching will apply the same rule and we will get the correct results.
    THE_CRYPT.hash(this.passwordHash, theSalt, null, (hashErr, theHash) => {
      if (hashErr) return next(hashErr)
      this.passwordHash = theHash
      next()
    })
  })
})

tmpUserSchm.methods.checkPassword = function (testedPass) { // To check if password match (same as in lecture video)
  return new Promise((resolve, reject) => {
    THE_CRYPT.compare(testedPass, this.passwordHash, function (compErr, boolResult) {
      if (compErr) return reject(compErr)
      resolve(boolResult)
    })
  })
}

let User = THE_MONG.model('User', tmpUserSchm, 'User') // Enforcing the name
module.exports = User
