
var expect = require("chai").expect
var util = require("util")
var async = require("async")
var request = require("superagent")

var Devchan = require("../../app/index.js")

describe("Routes Service", function() {
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

  describe("POST /services/echo", function() {
    var url = "localhost:3036/services/echo"
    var response1 = null

    before(function(done) {
      request.post(url).send({foo: false}).end(function(res) {
        response1 = res; done()
      })
    })

    it("should respond with echo", function() {
      expect(response1.status).to.equal(200)
      expect(response1.body).to.deep.equal({foo: false})
    })
  })

  describe("POST /services/markdown", function() {
    var url = "localhost:3036/services/markdown"
    var response1 = null

    before(function(done) {
      var text = "This is a **test**."
      request.post(url).send({text: text}).end(function(res) {
        response1 = res; done()
      })
    })

    it("should respond with compiled text", function() {
      expect(response1.status).to.equal(200)
      expect(response1.body.html).to.equal("<p>This is a <strong>test</strong>.</p>\n")
    })
  })


})
