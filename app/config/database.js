//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var mongoose = require("mongoose")

//-----------------------------------------------------------------------------
// MONGOOSE DB.
//-----------------------------------------------------------------------------

var db = {}

db.config = require(Devchan.rootPath + "/app/config/database.json")
db.handler = mongoose.createConnection()

db.connect = function(callback) {
  db.handler.open(db.config.host, db.config.database, db.config.port,
    {user: db.config.user, pass: db.config.pass}, callback)
}

mongoose.Query.prototype.dump = function() {
  this.exec(function(err, docOrDocs) {
    if (err) throw err
    console.log(docOrDocs)
  })
}

//-----------------------------------------------------------------------------
// MODULE EXPORTS.
//-----------------------------------------------------------------------------

module.exports = db
