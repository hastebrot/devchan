//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var http = require("http")
var path = require("path")

//-----------------------------------------------------------------------------
// DEVCHAN GLOBAL OBJECT.
//-----------------------------------------------------------------------------

module.exports = global.Devchan = Devchan = {}

//-----------------------------------------------------------------------------
// DEVCHAN PATHS.
//-----------------------------------------------------------------------------

Devchan.paths = {
  root: path.join(__dirname, ".."),
  public: path.join(__dirname, "../public"),
  views: path.join(__dirname, "../app/views")
}

//-----------------------------------------------------------------------------
// DEVCHAN EXPRESS APP.
//-----------------------------------------------------------------------------

Devchan.app = require("./config/application")

//-----------------------------------------------------------------------------
// DEVCHAN MONGOOSE DB.
//-----------------------------------------------------------------------------

Devchan.db = require("./config/database")

//-----------------------------------------------------------------------------
// DEVCHAN ROUTES.
//-----------------------------------------------------------------------------

require("./routes")

//-----------------------------------------------------------------------------
// DEVCHAN RUN.
//-----------------------------------------------------------------------------

Devchan.run = function() {
  Devchan.db.connect(function(err) {
    if (err) throw err
    console.log("Connected to database on port " + Devchan.db.config.port)
    http.createServer(Devchan.app).listen(Devchan.app.get("port"), function() {
      console.log("Express server listening on port " + Devchan.app.get("port"))
    })
  })
}
