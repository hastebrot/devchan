//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var http = require("http")
var path = require("path")

//-------------------------------------
// DEVCHAN GLOBAL OBJECT.
//-------------------------------------

//var used = []
//exports.use = function(fn) {
//  if (!~used.indexOf(fn)) {
//    fn(this)
//    used.push(fn)
//  }
//  return this
//}

module.exports = global.Devchan = Devchan = {}

//-------------------------------------
// DEVCHAN PATHS.
//-------------------------------------

Devchan.rootPath = path.join(__dirname, "..")

Devchan.paths = {
  public: Devchan.rootPath + "/public",
  views: Devchan.rootPath + "/app/views"
}

//-------------------------------------
// DEVCHAN EXPRESS APP.
//-------------------------------------

Devchan.app = require(Devchan.rootPath + "/app/config/application.js")

//-------------------------------------
// DEVCHAN MONGOOSE DB.
//-------------------------------------

Devchan.db = require(Devchan.rootPath + "/app/config/database.js")
Devchan.db.models = require(Devchan.rootPath + "/app/models/index.js")(Devchan).models

//-------------------------------------
// DEVCHAN ROUTES.
//-------------------------------------

require(Devchan.rootPath + "/app/routes/index.js")(Devchan)

//-------------------------------------
// DEVCHAN RUN.
//-------------------------------------

Devchan.run = function() {
  Devchan.db.connect(function(err) {
    if (err) throw err
    console.log("Connected to database on port " + Devchan.db.config.port)
    Devchan.app.start(function() {
      console.log("Express server listening on port " + Devchan.app.get("port"))
    })
  })
}
