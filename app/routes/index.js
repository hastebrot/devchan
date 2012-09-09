//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var fs = require("fs")

var _ = require("underscore")
var yaml = require("js-yaml")

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
   * request.get("/boards")
   */
  Devchan.app.get("/boards", function(req, res) {
    models.Board.find().sort("+name").exec(function(err, docs) {
      res.type("application/json").json(200, {docs: docs})
    })
  })

  /**
   * request.get("/boards/foo/threads").send({pageIndex: 1})
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
   * request.post("/boards/foo/threads").send({post: {})
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

      delete post._id
      post.index = board.currentPostIndex
      post.timestamp = new Date()
      post.commentHtml = marked(post.commentPlain)
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
   * request.get("/boards/foo/threads/1").send({})
   */
  Devchan.app.get("/boards/:boardName/threads/:threadIndex", function(req, res) {
    var boardName = req.params.boardName
    var threadIndex = req.params.threadIndex

    models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}).exec(function(err, doc) {
      res.type("application/json").json(200, {doc: doc})
    })
  })

  /**
   * request.post("/boards/foo/threads/1").send({post: {})
   */
  Devchan.app.post("/boards/:boardName/threads/:threadIndex", function(req, res) {
    var boardName = req.params.boardName
    var threadIndex = req.params.threadIndex
    var post = req.body.post

    models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}, function(err, thread) {
      if (err) throw err

      models.Board.allocatePostIndex({name: boardName}, function(err, board) {
        delete post._id
        post.index = board.currentPostIndex
        post.timestamp = new Date()
        post.commentHtml = marked(post.commentPlain)
        thread.posts.push(post)

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
}
