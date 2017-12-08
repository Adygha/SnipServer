/**
 * A module to access credentials in the database
 */

const THE_MONG = require('mongoose')
const THE_CRYPT = require('bcrypt-nodejs')

let tmpUserSchm = new THE_MONG.Schema({
  userName: {type: String, required: true, unique: true},
  passwordHash: {type: String, maxlength: 64, required: true}, // uppercase: true,
  // email: {type: String, required: true, unique: true},
  firstName: {type: String},
  lastName: {type: String},
  createDate: {type: Date, required: true, default: Date.now},
  lastVisit: {type: Date}
})

tmpUserSchm.pre('save', next => { // To hash before saving (same as in lecture video)
  THE_CRYPT.genSalt(10, (saltErr, theSalt) => {
    if (saltErr) return next(saltErr)
    // Next, since bcrypt only uses the first 72 bytes to hash, I thought it might be good
    // to first hash the password with SHA??? for example to avoid the situation when using
    // passwords longer than 72. Then thought that it does not matter since when matching,
    // the matching will apply the same rule and we will get the correct results.
    THE_CRYPT.hash(this.passwordHash, theSalt, (hashErr, theHash) => {
      if (hashErr) return next(hashErr)
      this.passwordHash = theHash
      next()
    })
  })
})

tmpUserSchm.methods.checkPassword = (testedPass) => { // To check if password match (same as in lecture video)
  return new Promise((resolve, reject) => {
    THE_CRYPT.compare(testedPass, this.passwordHash, (compErr, boolResult) => {
      if (compErr) return reject(compErr)
      resolve(boolResult)
    })
  })
}

let User = THE_MONG.model('User', tmpUserSchm)

module.exports = User
