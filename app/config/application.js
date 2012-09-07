//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var express = require("express")

//-----------------------------------------------------------------------------
// EXPRESS APP.
//-----------------------------------------------------------------------------

var app = express()

app.configure(function() {
  app.set("port", process.env.PORT || 3789)
  app.set("views", Devchan.paths.views)
  app.set("view engine", "jade")
  app.use(express.favicon())
  app.use(express.logger("dev"))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(Devchan.paths.public))
})

app.configure("development", function() {
  app.use(express.errorHandler())
})

//-----------------------------------------------------------------------------
// MODULE EXPORTS.
//-----------------------------------------------------------------------------

module.exports = app
