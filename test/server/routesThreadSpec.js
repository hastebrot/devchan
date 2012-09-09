
var Devchan = require("../../app/index.js")
var expect = require("chai").expect
var request = require("superagent")
var async = require("async")

var Board = Devchan.db.models.Board
var Thread = Devchan.db.models.Thread

describe("Routes Thread", function() {
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

  describe("GET /boards/:boardName/threads", function() {
    var board1 = {_id: "board-1", name: "foo"}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date()}
    var thread2 = {_id: "thread-2", boardName: "foo", initialPostIndex: 2, lastTimestamp: new Date()}
    var result1 = null

    before(function(done) {
      Board.create(board1, function(err, doc) {
        if (err) throw err
        Thread.create(thread1, function(err, doc) {
          if (err) throw err
          Thread.create(thread2, done)
        })
      })
    })

    before(function(done) {
      request.get("localhost:3036/boards/" + board1.name + "/threads")
        .send({pageIndex: 1})
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
      expect(result1.body).to.have.property("docs")
    })

    it("should service return docs data", function() {
      expect(result1.body.docs).to.have.length(2)
      expect(result1.body.docs[0]).to.contain.key("_id")
      expect(result1.body.docs[0]).to.contain.key("initialPostIndex")
      expect(result1.body.docs[0]).to.contain.key("lastTimestamp")
    })
  })

  describe("POST /boards/:boardName/threads", function() {
    var board1 = {_id: "board-1", name: "foo", currentPostIndex: 0}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date()}
    var thread2 = {_id: "thread-2", boardName: "foo", initialPostIndex: 2, lastTimestamp: new Date()}
    var post1 = {_id: "post-1", commentPlain: "This is a **comment**."}
    var result1 = null

    before(function(done) {
      Board.create(board1, function(err, doc) {
        if (err) throw err
        Thread.create(thread1, function(err, doc) {
          if (err) throw err
          Thread.create(thread2, done)
        })
      })
    })

    before(function(done) {
      request.post("localhost:3036/boards/" + board1.name + "/threads")
        .send({post: post1})
        .end(function(res) {
          result1 = res
          done()
        })
    })

    after(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    it("should service return status 201 (created)", function() {
      expect(result1.ok).to.be.true
      expect(result1.status).to.equal(201)
    })

    it("should service return doc and ref", function() {
      expect(result1.body).to.contain.keys("doc", "ref")
      expect(result1.body.ref).to.match(/\/boards\/(\w+)\/threads\/(\w+)/)
    })

    it("should service return doc data", function() {
      expect(result1.body.doc).to.not.have.property("_id", "thread-1")
      expect(result1.body.doc).to.have.property("initialPostIndex", 1)
      expect(result1.body.doc.posts).to.have.length(1)
      expect(result1.body.doc.posts[0]).to.not.have.property("_id", "post-1")
      expect(result1.body.doc.posts[0]).to.have.property("commentPlain", "This is a **comment**.")
      expect(result1.body.doc.posts[0]).to.have.property("commentHtml", "<p>This is a <strong>comment</strong>.</p>\n")
      expect(result1.body.doc.posts[0]).to.have.property("sage", false)
    })

    it.skip("should database contain doc data", function(done) {
      Thread.findOne({posts: {$elemMatch: post1}}, function(err, doc) {
        if (err) throw err
        expect(doc.posts).to.have.length(1)
        done()
      })
    })
  })

  describe("GET /boards/:boardName/threads/:threadIndex", function() {
    var board1 = {_id: "board-1", name: "foo"}
    var post1 = {_id: "post-1", commentPlain: "This is a **comment**.",
      commentHtml: "<p>This is a <strong>comment</strong>.</p>\n"}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, posts: [post1]}
    var result1 = null

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        },
      ], done)
    })

    before(function(done) {
      request.get("localhost:3036/boards/" + board1.name + "/threads/" + thread1.initialPostIndex)
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

    it("should service return doc", function() {
      expect(result1.body).to.contain.key("doc")
    })

    it("should service return doc data", function() {
      expect(result1.body.doc).to.have.property("_id", "thread-1")
      expect(result1.body.doc).to.have.property("boardName", "foo")
      expect(result1.body.doc).to.have.property("initialPostIndex", 1)
      expect(result1.body.doc.posts).to.have.length(1)
      expect(result1.body.doc.posts[0]).to.have.property("_id", "post-1")
      expect(result1.body.doc.posts[0]).to.have.property("commentPlain", "This is a **comment**.")
      expect(result1.body.doc.posts[0]).to.have.property("commentHtml", "<p>This is a <strong>comment</strong>.</p>\n")
    })
  })

  describe("POST /boards/:boardName/threads/:threadIndex", function() {
    var board1 = {_id: "board-1", name: "foo"}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date()}
    var post1 = {_id: "post-1", commentPlain: "This is a *comment*."}
    var result1 = null

    before(function(done) {
      Board.create(board1, function(err, doc) {
        if (err) throw err
        Thread.create(thread1, done)
      })
    })

    before(function(done) {
      request.post("localhost:3036/boards/" + board1.name + "/threads/" + thread1.initialPostIndex)
        .send({threadId: thread1._id, post: post1})
        .end(function(res) {
          result1 = res
          done()
        })
    })

    after(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    it("should service return status 201 (created)", function() {
      expect(result1.ok).to.be.true
      expect(result1.status).to.equal(201)
    })

    it("should service return doc and ref", function() {
      expect(result1.body).to.contain.keys("doc", "ref")
      expect(result1.body.ref).to.match(/\/boards\/(\w+)\/threads\/(\w+)\/(\w+)/)
    })

    it.skip("should database contain doc data", function(done) {
      Thread.findOne({posts: {$elemMatch: post1}}, function(err, doc) {
        if (err) throw err
        expect(doc.posts).to.have.length(1)
        done()
      })
    })
  })

  describe("DELETE /boards/:boardName/threads/:threadIndex", function() {})

  describe("DELETE /boards/:boardName/threads/:threadIndex/:postIndex", function() {})
})