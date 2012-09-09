//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var express = require("express")
var http = require("http")

//-----------------------------------------------------------------------------
// EXPRESS APP.
//-----------------------------------------------------------------------------

var app = express()

app.configure(function() {
  app.set("port", process.env.PORT || 3789)
  app.set("views", Devchan.paths.views)
  app.set("view engine", "jade")
  app.use(express.favicon())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(Devchan.paths.public))
})

app.configure("development", function() {
  app.use(express.errorHandler())
  app.use(express.logger("dev"))
})

//-----------------------------------------------------------------------------
// HELPER METHODS.
//-----------------------------------------------------------------------------

app.start = function(callback) {
  app.handler = http.createServer(app)
  app.handler.listen(app.get("port"), callback)
}

app.stop = function(callback) {
  app.handler.close(callback)
}

//-----------------------------------------------------------------------------
// MODULE EXPORTS.
//-----------------------------------------------------------------------------

module.exports = app
