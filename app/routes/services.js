//-------------------------------------
// SERVICE ROUTES.
//-------------------------------------

module.exports = function(Devchan) {
  Devchan.app.post("/services/echo", function(req, res) {
    res.json(200, req.body)
  })

  //Devchan.app.get("/services/markdown", function(req, res) {})
  //Devchan.app.get("/services/upload", function(req, res) {})
}
