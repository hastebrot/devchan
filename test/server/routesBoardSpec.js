
var Devchan = require("../../app/index.js")
var expect = require("chai").expect
var request = require("superagent")

var Board = Devchan.db.models.Board

describe("Routes Board", function() {
  var webserverPort = 3036
  var databaseName = "devchan-test"

  before(function(done) {
    Devchan.db.config.database = databaseName
    Devchan.db.connect(function() {
      Devchan.db.handler.db.dropDatabase(function() {
        Devchan.app.set("port", webserverPort)
        Devchan.app.set("env", "test")
        Devchan.app.start(done)
      })
    })
  })

  after(function(done) {
    Devchan.db.disconnect(function() {
      Devchan.app.stop(done)
    })
  })

  describe("GET /boards", function() {
    var board1 = {_id: "board-1", name: "foo"}
    var board2 = {_id: "board-2", name: "bar"}
    var result1 = null

    before(function(done) {
      Board.create(board1, function(err, doc) {
        if (err) throw err
        Board.create(board2, done)
      })
    })

    before(function(done) {
      request.get("localhost:3036/boards")
        .send({})
        .end(function(res) {
          result1 = res
          done()
      })
    })

    after(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    it("should service return status 200 (ok)", function() {
      expect(result1.ok).to.be.true
      expect(result1.status).to.equal(200)
    })

    it("should service return docs", function() {
      expect(result1.body).to.contain.key("docs")
    })

    it("should service return docs data", function() {
      expect(result1.body.docs).to.have.length(2)
      expect(result1.body.docs[0]).to.contain.key("_id")
      expect(result1.body.docs[0]).to.contain.key("name")
    })
  })
})
