//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var marked = require("marked")
marked.setOptions({gfm: true, pedantic: false, sanitize: true})

//-------------------------------------
// SERVICE ROUTES.
//-------------------------------------

module.exports = function(Devchan) {
  Devchan.app.post("/services/echo", function(req, res) {
    res.json(200, req.body)
  })

  Devchan.app.post("/services/markdown", function(req, res) {
    var html = marked(req.body.text)
    res.json(200, {html: html})
  })

  //Devchan.app.post("/services/upload", function(req, res) {})
}
