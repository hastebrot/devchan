//-----------------------------------------------------------------------------
// START SHELL.
//-----------------------------------------------------------------------------

var Devchan = require("./app/index")
var terminal = require("./app/config/terminal")

Devchan.db.connect(function(err) {
  if (err) throw err
  terminal.start("devchan> ", Devchan.app, Devchan.db)
})
