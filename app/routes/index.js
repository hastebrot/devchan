//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var fs = require("fs")

var _ = require("underscore")
var yaml = require("js-yaml")
var marked = require("marked")

//-----------------------------------------------------------------------------
// APPLICATION ROUTES.
//-----------------------------------------------------------------------------

var models = Devchan.db.models

Devchan.app.get("/", function(req, res) {
  res.render("index", {title: "devchan"})
})

Devchan.app.get("/boards", function(req, res) {
  models.Board.find().sort("+name").exec(function(err, docs) {
    res.type("application/json").json({docs: docs})
  })
})

Devchan.app.get("/threads", function(req, res) {
  var boardName = req.query.boardName
  var pageIndex = req.query.pageIndex
  models.Thread
    .find({boardName: boardName})
    .sort("-lastTimestamp -initialPostIndex")
    .limit(5).skip((pageIndex - 1) * 5)
    .exec(function(err, docs) {
      //console.log(docs)
      // docs = _.collect(docs, function(doc) { return doc.toObject({
      //   virtuals: false
      // }) })
      res.type("application/json").json({docs: docs})
    })
})

Devchan.app.get("/thread", function(req, res) {
  var boardName = req.query.boardName
  var threadIndex = req.query.threadIndex

  models.Thread.findOne({boardName: boardName, initialPostIndex: threadIndex}).exec(function(err, doc) {
    res.type("application/json").json({doc: doc})
  })
})

Devchan.app.post("/threads", function(req, res) {
  var board = req.body.board
  var post = req.body.post

  models.Board.allocatePostIndex({name: board.name}, function(err, board) {
    if (err) throw err
    post.index = board.currentPostIndex
    //post.timestamp = new Date()
    marked.setOptions({gfm: true, pedantic: false, sanitize: true})
    post.commentHtml = marked(post.commentPlain)

    var thread = new models.Thread({
      boardName: board.name,
      initialPostIndex: post.index,
      lastTimestamp: post.timestamp,
      posts: [post]
    })
    thread.save(function(err) {
      if (err) throw err
      res.type("application/json").json({message: "Done."})
    })
  })
})

Devchan.app.post("/posts", function(req, res) {
  var board = req.body.board
  var thread = req.body.thread
  var post = req.body.post

  models.Board.allocatePostIndex({name: board.name}, function(err, board) {
    if (err) throw err
    post.index = board.currentPostIndex
    //post.timestamp = new Date()
    marked.setOptions({gfm: true, pedantic: false, sanitize: true})
    post.commentHtml = marked(post.commentPlain)

    models.Thread.findOne({boardName: thread.boardName, initialPostIndex: thread.initialPostIndex}, function(err, doc) {
      if (err) throw err

      doc.posts.push(post)
      doc.save(function(err) {
        if (err) throw err
        res.type("application/json").json({message: "Done."})
      })
    })
  })
})

Devchan.app.get("/threads-static.json", function(req, res) {
  var data = yaml.load(fs.readFileSync("./data/fixture/threads-static.yml"))

  marked.setOptions({gfm: true, pedantic: false, sanitize: true})
  data.forEach(function(thread) {
    thread.posts.forEach(function(post) {
      post.commentHtml = marked(post.commentPlain)
    })
  })

  //res.set("Content-Type", "application/json").send(data)
  res.type("application/json").json(data)
})

Devchan.app.get("/threads-generated.json", function(req, res) {
  var evalObjectTemplates = function(data, templateData) {
    var objectQueue = []
    objectQueue.push(data)
    while (objectQueue.length > 0) {
      var obj = objectQueue.pop()
      _.each(obj, function(val, key) {
        if (_.isObject(val)) {
          objectQueue.push(val)
        }
        else if (_.isString(val)) {
          obj[key] = _.template(val, templateData)
        }
      })
    }
    return data
  }

  var data = yaml.load(fs.readFileSync("./data/fixture/threads-generated.yml"))

  var charlatan = require("charlatan")
  charlatan.setLocale("de")
  var templateData = {Charlatan: charlatan}
  data = evalObjectTemplates(data, templateData)
  //console.log(JSON.stringify(data, true, 2))

  marked.setOptions({gfm: true, pedantic: false, sanitize: true})
  data.forEach(function(thread) {
    thread.posts.forEach(function(post) {
      post.commentHtml = marked(post.commentPlain)
    })
  })

  res.type("application/json").json(data)
})