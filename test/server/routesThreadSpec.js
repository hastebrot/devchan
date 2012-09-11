
var expect = require("chai").expect
var util = require("util")
var async = require("async")
var request = require("superagent")
var passwordHash = require("password-hash")

var Devchan = require("../../app/index.js")
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
    var url = "localhost:3036/boards/%s/threads"

    var board1 = {_id: "board-1", name: "foo", currentPostIndex: 2}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1}
    var thread2 = {_id: "thread-2", boardName: "foo", initialPostIndex: 2}

    var response1 = null

    before(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        },
        function(callback) {
          Thread.create(thread2, callback)
        }
      ], done)
    })

    before(function(done) {
      request.get(util.format(url, board1.name)).send({pageIndex: 1}).end(function(res) {
        response1 = res; done()
      })
    })

    describe("context webapi", function() {
      it("should service return status 200 (ok)", function() {
        expect(response1.ok).to.be.true
        expect(response1.status).to.equal(200)
      })

      it("should service return docs", function() {
        expect(response1.body).to.have.property("docs")
      })
    })

    describe("context webapi data", function() {
      it("should service return docs data", function() {
        expect(response1.body.docs).to.have.length(2)
        expect(response1.body.docs[0]).to.contain.key("_id")
        expect(response1.body.docs[0]).to.contain.key("initialPostIndex")
      })
    })
  })

  describe("POST /boards/:boardName/threads", function() {
    var url = "localhost:3036/boards/%s/threads"

    var board1 = {_id: "board-1", name: "foo", currentPostIndex: 0}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date()}
    var thread2 = {_id: "thread-2", boardName: "foo", initialPostIndex: 2, lastTimestamp: new Date()}
    var post1 = {_id: "post-1", sage: false, commentPlain: "This is a **comment**."}
    var post2 = {_id: "post-2", sage: true, commentPlain: "This is a **comment**."}
    var post3 = {_id: "post-3", commentPlain: "This is a **comment**."}
    var post4 = {_id: "post-4", password: "foo", commentPlain: "This is a **comment**."}

    var response1 = null
    var response2 = null
    var response3 = null
    var response4 = null
    var result1 = null
    var result2 = null

    before(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        },
        function(callback) {
          Thread.create(thread2, callback)
        }
      ], done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          request.post(util.format(url, board1.name)).send({post: post1}).end(function(res) {
            response1 = res; callback()
          })
        },
        function(callback) {
          request.post(util.format(url, board1.name)).send({post: post2}).end(function(res) {
            response2 = res; callback()
          })
        },
        function(callback) {
          request.post(util.format(url, board1.name)).send({post: post3}).end(function(res) {
            response3 = res; callback()
          })
        },
        function(callback) {
          request.post(util.format(url, board1.name)).send({post: post4}).end(function(res) {
            response4 = res; callback()
          })
        }
      ], done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Thread.findById(response3.body.doc._id, function(err, doc) {
            if (err) throw err
            result1 = doc; callback()
          })
        },
        function(callback) {
          Thread.findById(response4.body.doc._id, function(err, doc) {
            if (err) throw err
            result2 = doc; callback()
          })
        }
      ], done)
    })

    describe("context webapi", function() {
      it("should service return status 201 (created)", function() {
        expect(response1.ok).to.be.true
        expect(response1.status).to.equal(201)
      })

      it("should service return doc and ref", function() {
        expect(response1.body).to.contain.keys("doc", "ref")
        expect(response1.body.ref).to.match(/\/boards\/(\w+)\/threads\/(\w+)/)
      })
    })

    describe("context webapi data", function() {
      it("should service return doc data", function() {
        //expect(response1.body.doc).to.not.have.property("_id", "thread-1")
        expect(response1.body.doc).to.have.property("initialPostIndex", 1)
        expect(response1.body.doc.posts).to.have.length(1)
        //expect(response1.body.doc.posts[0]).to.not.have.property("_id", "post-1")
        expect(response1.body.doc.posts[0]).to.have.property("commentPlain", "This is a **comment**.")
        expect(response1.body.doc.posts[0]).to.have.property("commentHtml",
          "<p>This is a <strong>comment</strong>.</p>\n")
      })
    })

    describe("context sage", function() {
      describe("when initial post without sage", function() {
        it("should service return doc data", function() {
          expect(response2.body.doc.posts[0]).to.have.property("sage", true)
        })
      })

      describe("when initial post with sage", function() {
        it("should service return doc data", function() {
          expect(response2.body.doc.posts[0]).to.have.property("sage", true)
        })
      })
    })

    describe("context password", function() {
      it("should save without password", function() {
        expect(result1.posts[0]).to.not.have.property("password")
        expect(result1.posts[0]).to.have.property("passwordHashed", "")
      })

      it("should save with password", function() {
        expect(result2.posts[0]).to.not.have.property("password")
        expect(result2.posts[0]).to.have.property("passwordHashed").with.length.above(0)
        expect(passwordHash.verify(post4.password, result2.posts[0].passwordHashed)).to.be.ok
      })
    })
  })

  describe("GET /boards/:boardName/threads/:threadIndex", function() {
    var url = "localhost:3036/boards/%s/threads/%s"

    var board1 = {_id: "board-1", name: "foo"}
    var post1 = {_id: "post-1", commentPlain: "This is a **comment**.",
      commentHtml: "<p>This is a <strong>comment</strong>.</p>\n"}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, posts: [post1]}

    var response1 = null

    before(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        }
      ], done)
    })

    before(function(done) {
      request.get(util.format(url, board1.name, thread1.initialPostIndex)).send({}).end(function(res) {
        response1 = res; done()
      })
    })

    describe("context webapi", function() {
      it("should service return status 200 (ok)", function() {
        expect(response1.ok).to.be.true
        expect(response1.status).to.equal(200)
      })

      it("should service return doc", function() {
        expect(response1.body).to.contain.key("doc")
      })
    })

    describe("context webapi data", function() {
      it("should service return doc data", function() {
        //expect(response1.body.doc).to.have.property("_id", "thread-1")
        expect(response1.body.doc).to.have.property("boardName", "foo")
        expect(response1.body.doc).to.have.property("initialPostIndex", 1)
        expect(response1.body.doc.posts).to.have.length(1)
        //expect(response1.body.doc.posts[0]).to.have.property("_id", "post-1")
        expect(response1.body.doc.posts[0]).to.have.property("commentPlain", "This is a **comment**.")
        expect(response1.body.doc.posts[0]).to.have.property("commentHtml",
          "<p>This is a <strong>comment</strong>.</p>\n")
      })
    })
  })

  describe("POST /boards/:boardName/threads/:threadIndex", function() {
    var url = "localhost:3036/boards/%s/threads/%s"

    var board1 = {_id: "board-1", name: "foo"}
    var post1 = {_id: "post-1", sage: true, commentPlain: "This is a *comment*."}
    var post2 = {_id: "post-2", sage: false, commentPlain: "This is a *comment*."}
    var post3 = {_id: "post-3", sage: true, commentPlain: "This is a *comment*."}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date(),
      posts: [post1]}

    var response1 = null
    var response2 = null
    var result1 = null

    before(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        }
      ], done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          request.post(util.format(url, board1.name, thread1.initialPostIndex)).send({post: post2}).end(function(res) {
            response1 = res; callback()
          })
        },
        function(callback) {
          request.post(util.format(url, board1.name, thread1.initialPostIndex)).send({post: post3}).end(function(res) {
            response2 = res; callback()
          })
        }
      ], done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Thread.findById(response1.body.doc._id, function(err, doc) {
            if (err) throw err
            result1 = doc; callback()
          })
        }
      ], done)
    })

    describe("context webapi", function() {
      it("should service return status 201 (created)", function() {
        expect(response1.ok).to.be.true
        expect(response1.status).to.equal(201)
      })

      it("should service return doc and ref", function() {
        expect(response1.body).to.contain.keys("doc", "ref")
        expect(response1.body.ref).to.match(/\/boards\/(\w+)\/threads\/(\w+)\/(\w+)/)
      })
    })

    describe("context database", function() {
      it("should database contain doc data", function() {
        expect(result1.posts).to.have.length(3)
      })
    })

    describe("context sage", function() {
      describe("when subsequent post without sage", function() {
        it("should service return doc data", function() {
          expect(response1.body.doc.lastTimestamp).to.equal(response1.body.doc.posts[1].timestamp)
          expect(response1.body.doc.posts[1]).to.have.property("sage", false)
        })
      })

      describe("when subsequent post with sage", function() {
        it("should service return doc data", function() {
          expect(response2.body.doc.lastTimestamp).to.not.equal(response2.body.doc.posts[2].timestamp)
          expect(response2.body.doc.posts[2]).to.have.property("sage", true)
        })
      })
    })
  })

  describe("DELETE /boards/:boardName/threads/:threadIndex/:postIndex", function() {
    var url = "localhost:3036/boards/%s/threads/%s/%s"

    var board1 = {_id: "board-1", name: "foo"}

    var post1 = {_id: "post-1", index: 1, commentPlain: "This is a **comment**."}
    var post2 = {_id: "post-2", index: 2, commentPlain: "This is a **comment**."}
    var thread1 = {_id: "thread-1", boardName: "foo", initialPostIndex: 1, lastTimestamp: new Date(),
      posts: [post1, post2]}

    var post3 = {_id: "post-3", index: 3, passwordHashed: passwordHash.generate("foo"),
      commentPlain: "This is a **comment**."}
    var post4 = {_id: "post-4", index: 4, passwordHashed: passwordHash.generate("foo"),
      commentPlain: "This is a **comment**."}
    var thread2 = {_id: "thread-2", boardName: "foo", initialPostIndex: 3, lastTimestamp: new Date(),
      posts: [post3, post4]}

    var response1 = null
    var result1 = null
    var response2 = null
    var result2 = null

    before(function(done) {
      Devchan.db.handler.db.dropDatabase(done)
    })

    before(function(done) {
      async.series([
        function(callback) {
          Board.create(board1, callback)
        },
        function(callback) {
          Thread.create(thread1, callback)
        },
        function(callback) {
          Thread.create(thread2, callback)
        }
      ], done)
    })

    describe("with empty password", function() {
      it("should not delete subsequent post", function(done) {
        request.del(util.format(url, board1.name, thread1.initialPostIndex, post2.index)).end(function(res) {
          expect(res.status).to.equal(403)
          Thread.findById(thread1._id, function(err, doc) {
            if (err) throw err
            expect(doc.posts).to.have.length(2)
            done()
          })
        })
      })

      it("should not delete initial post", function(done) {
        request.del(util.format(url, board1.name, thread1.initialPostIndex, post1.index)).end(function(res) {
          expect(res.status).to.equal(403)
          Thread.findById(thread1._id, function(err, doc) {
            if (err) throw err
            expect(doc.posts).to.have.length(2)
            done()
          })
        })
      })
    })

    describe("context passwords", function(done) {
      describe("with empty password", function() {
        it("should not delete subsequent post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post4.index)).end(function(res) {
              expect(res.status).to.equal(403)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc.posts).to.have.length(2)
                done()
              })
          })
        })

        it("should not delete initial post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post3.index)).end(function(res) {
              expect(res.status).to.equal(403)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc.posts).to.have.length(2)
                done()
              })
          })
        })
      })

      describe("with invalid password", function() {
        it("should not delete subsequent post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post4.index))
            .send({password: "wrong"}).end(function(res) {
              expect(res.status).to.equal(403)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc.posts).to.have.length(2)
                done()
              })
          })
        })

        it("should not delete initial post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post3.index))
            .send({password: "wrong"}).end(function(res) {
              expect(res.status).to.equal(403)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc.posts).to.have.length(2)
                done()
              })
          })
        })
      })

      describe("with valid password", function() {
        it("should delete subsequent post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post4.index))
            .send({password: "foo"}).end(function(res) {
              expect(res.status).to.equal(200)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc.posts).to.have.length(1)
                expect(doc.posts[0]._id).to.equal(post3._id)
                done()
              })
          })
        })

        it("should delete initial post", function(done) {
          request.del(util.format(url, board1.name, thread2.initialPostIndex, post3.index))
            .send({password: "foo"}).end(function(res) {
              expect(res.status).to.equal(200)
              Thread.findById(thread2._id, function(err, doc) {
                if (err) throw err
                expect(doc).to.be.null
                done()
              })
          })
        })
      })
    })
  })
})
