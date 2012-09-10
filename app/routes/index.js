//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var fs = require("fs")

var _ = require("underscore")
var yaml = require("js-yaml")

var passwordHash = require("password-hash")
var marked = require("marked")
marked.setOptions({gfm: true, pedantic: false, sanitize: true})

//-------------------------------------
// APPLICATION ROUTES.
//-------------------------------------

module.exports = function(Devchan) {
  var models = Devchan.db.models

  /**
   * request.get("/")
   */
  Devchan.app.get("/", function(req, res) {
    res.render("index", {title: "devchan"})
  })

  /**
   * request.get("/boards").end()
   */
  Devchan.app.get("/boards", function(req, res) {
    models.Board.find().sort("+name").exec(function(err, docs) {
      res.type("application/json").json(200, {docs: docs})
    })
  })

  /**
   * request.get("/boards/foo/threads").send({pageIndex: 1}).end()
   */
  Devchan.app.get("/boards/:boardName/threads", function(req, res) {
    var boardName = req.params.boardName
    var pageIndex = req.query.pageIndex

    models.Thread
      .find({boardName: boardName})
      .sort("-lastTimestamp -initialPostIndex")
      .limit(5).skip((pageIndex - 1) * 5)
      .exec(function(err, threads) {
        if (err) throw err
        //threads = _.collect(threads, function(thread) {
        //  return thread.toObject({virtuals: false})
        //})
        res.type("application/json").json(200, {docs: threads})
      })
  })

  /**
   * request.post("/boards/foo/threads").send({post: {}).end()
   */
  Devchan.app.post("/boards/:boardName/threads", function(req, res) {
    var boardName = req.params.boardName
    var post = req.body.post

    models.Board.allocatePostIndex({name: boardName}, function(err, board) {
      if (err) throw err

      var thread = new models.Thread({
        boardName: board.name,
        initialPostIndex: board.currentPostIndex,
        lastTimestamp: post.timestamp,
        posts: []
      })

      //delete post._id
      post.index = board.currentPostIndex
      post.timestamp = new Date()
      post.commentHtml = marked(post.commentPlain)
      post.passwordHashed = post.password && post.password.length > 0 ?
        passwordHash.generate(post.password) : ""
      thread.posts.push(post)

      thread.save(function(err) {
        if (err) throw err
        res.type("application/json").json(201, {
          doc: thread,
          ref: "/boards/" + board.name + "/threads/" + thread.initialPostIndex
        })
      })
    })
  })

  /**
   * request.get("/boards/foo/threads/1").send({}).end()
   */
  Devchan.app.get("/boards/:boardName/threads/:threadIndex", function(req, res) {
    var boardName = req.params.boardName
    var threadIndex = req.params.threadIndex

    models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}).exec(function(err, doc) {
      res.type("application/json").json(200, {doc: doc})
    })
  })

  /**
   * request.post("/boards/foo/threads/1").send({post: {}).end()
   */
  Devchan.app.post("/boards/:boardName/threads/:threadIndex", function(req, res) {
    var boardName = req.params.boardName
    var threadIndex = req.params.threadIndex
    var post = req.body.post

    models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}, function(err, thread) {
      if (err) throw err

      models.Board.allocatePostIndex({name: boardName}, function(err, board) {
        //delete post._id
        post.index = board.currentPostIndex
        post.timestamp = new Date()
        post.commentHtml = marked(post.commentPlain)
        thread.posts.push(post)
        if (!post.sage) {
          thread.lastTimestamp = post.timestamp
        }

        thread.save(function(err) {
          if (err) throw err
          res.type("application/json").json(201, {
            doc: thread,
            ref: "/boards/" + board.name + "/threads/" + thread.initialPostIndex + "/" + post.index
          })
        })
      })
    })
  })

  /**
   * request.del("/boards/foo/threads/1/2").end()
   */
  Devchan.app.del("/boards/:boardName/threads/:threadIndex/:postIndex", function(req, res) {
    var boardName = req.params.boardName
    var threadIndex = req.params.threadIndex
    var postIndex = req.params.postIndex
    var password = req.body.password

    models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}, function(err, thread) {
      if (err) throw err

      var postToRemove = _.find(thread.posts, function(post) {
        return post.index == postIndex
      })

      if (postToRemove.passwordHashed && postToRemove.passwordHashed.length > 0) {
        if(!passwordHash.verify(password, postToRemove.passwordHashed)) {
          return res.type("application/json").json(403, {})
        }
      }

      if (threadIndex === postIndex) {
        thread.remove(function(err) {
          if (err) throw err
          res.type("application/json").json(200, {})
        })
      }
      else {
        thread.posts.remove(postToRemove)
        thread.save(function(err, doc) {
          if (err) throw err
          res.type("application/json").json(200, {doc: doc})
        })
      }
    })
  })
}
