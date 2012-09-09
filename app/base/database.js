//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var mongoose = require("mongoose")

mongoose.Query.prototype.dump = function() {
  this.exec(function(err, docOrDocs) {
    if (err) throw err
    console.log(docOrDocs)
  })
}

//-------------------------------------
// MONGOOSE DB.
//-------------------------------------

module.exports = function(Devchan) {
  var db = {}

  db.config = require(Devchan.rootPath + "/app/config/database.json")
  db.handler = mongoose.createConnection()

  //-------------------------------------
  // HELPER METHODS.
  //-------------------------------------

  db.connect = function(callback) {
    db.handler.open(db.config.host, db.config.database, db.config.port,
      {user: db.config.user, pass: db.config.pass}, callback)
  }

  db.disconnect = function(callback) {
    db.handler.close(callback)
  }

  //-------------------------------------
  // MODULE EXPORTS.
  //-------------------------------------

  return db
}
