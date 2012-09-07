//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var mongoose = require("mongoose")
var shortid = require("shortid")

//-----------------------------------------------------------------------------
// DATABASE SCHEMAS.
//-----------------------------------------------------------------------------

exports.attachmentSchema = new mongoose.Schema({
  index: {type: Number, index: {unique: false}},
  filename: String,
  filetype: String,
  filesize: String,
  imagesize: String
})

exports.postSchema = new mongoose.Schema({
  index: {type: Number, index: {unique: false}},
  timestamp: Date,
  name: String,
  subject: String,
  commentPlain: String,
  commentHtml: String,
  sage: Boolean,
  password: String,
  attachments: [exports.attachmentSchema]
})

exports.threadSchema = new mongoose.Schema({
  boardName: {type: String, index: {unique: false}},
  lastTimestamp: {type: Date, index: {unique: false}},
  initialPostIndex: {type: Number, index: {unique: false}},
  posts: [exports.postSchema]
})

exports.boardSchema = new mongoose.Schema({
  // https://github.com/dylang/shortid/issues/1
  // http://stackoverflow.com/questions/11524549/node-js-mongoose-mongo-a-shortened-id-field
  // http://mongoosejs.com/docs/api.html#schema_Schema-static
  _id: {type: String, unique: true, "default": function() { return shortid.generate() }},

  name: {type: String, index: {unique: true}},
  currentPostIndex: {type: Number, "default": 0}
})

exports.boardSchema.statics.allocatePostIndex = function(query, callback) {
  var update = {$inc: {currentPostIndex: 1}}
  this.findOneAndUpdate(query, update, callback)
}
