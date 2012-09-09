//-----------------------------------------------------------------------------
// START SHELL.
//-----------------------------------------------------------------------------

var _ = require("underscore")
var Devchan = require("./app/index")
var terminal = require("./app/config/terminal")

Devchan.db.connect(function(err) {
  if (err) throw err

  var contextVariables = {
    app: Devchan.app,
    db: Devchan.db
  }
  _.extend(contextVariables, Devchan.db.models)

  console.log("Usage:")
  console.log("\tDevchan> app.routes")
  console.log("\tDevchan> db.models")
  console.log("\tDevchan> Board.find({name: 'prog'}, c)")
  console.log("\n")
  terminal.start("Devchan> ", contextVariables)
})
