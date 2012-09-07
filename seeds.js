//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var fs = require("fs")
var _ = require("underscore")

var yaml = require("js-yaml")

//-----------------------------------------------------------------------------
// DATA SEEDER.
//-----------------------------------------------------------------------------

var Devchan = require("./app/index")
var fixtures = fs.readdirSync("./data/fixture")
var models = Devchan.db.models

console.log("models:", _.keys(Devchan.db.models))
console.log("fixtures:", fixtures)

Devchan.db.connect(function(err) {
  if (err) throw err

  var boards = require("./data/fixture/boards-static.yml")
  _.each(boards, function(board) {
    console.log(board)
    models.Board(board).save()
  })
})
