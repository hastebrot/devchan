//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var mongoose = require("mongoose")

//-------------------------------------
// REGISTER MODELS.
//-------------------------------------

module.exports = function(Devchan) {
  var exports = {}

  var schemas = require(Devchan.rootPath + "/app/models/schemas.js")

  exports.models = {}
  exports.models.Board = Devchan.db.handler.model("Board", schemas.boardSchema)
  exports.models.Thread = Devchan.db.handler.model("Thread", schemas.threadSchema)

  return exports
}
