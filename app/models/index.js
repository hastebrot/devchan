//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var mongoose = require("mongoose")
var schemas = require(Devchan.rootPath + "/app/models/schemas.js")

//-----------------------------------------------------------------------------
// REGISTER MODELS.
//-----------------------------------------------------------------------------

exports.models = function(db) {
  var models = {}

  models.Board = db.handler.model("Board", schemas.boardSchema)
  models.Thread = db.handler.model("Thread", schemas.threadSchema)

  return models
}
