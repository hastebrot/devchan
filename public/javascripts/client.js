
var getBoards = function(callback) {
  var url = "/boards"
  var query = {}
  request.get(url).send(query).end(function(res) {
    //console.log("getBoards:", JSON.stringify(res.body))
    var boards = _.collect(res.body.docs, function(doc) {
      return new models.Board(doc)
    })
    callback(boards)
  })
}

var getThreads = function(boardName, pageIndex, callback) {
  var url = "/boards/" + boardName + "/threads"
  var query = {pageIndex: pageIndex}
  request.get(url).send(query).end(function(res) {
    //console.log("getThreads:", JSON.stringify(res.body))
    var threads = _.collect(res.body.docs, function(doc) {
      return new models.Thread(doc, {
        lastTimestamp: helpers.koMappingObject(Date),
        posts: helpers.koMappingModel(models.Post, {
          timestamp: helpers.koMappingObject(Date),
          attachments: helpers.koMappingModel(models.Attachment)
        })
      })
    })
    callback(threads)
  })
}

var getThread = function(boardName, threadIndex, callback) {
  var url = "/boards/" + boardName + "/threads/" + threadIndex
  var query = {}
  request.get(url).send(query).end(function(res) {
    //console.log("getThread:", JSON.stringify(res.body))
    var thread = new models.Thread(res.body.doc, {
      lastTimestamp: helpers.koMappingObject(Date),
      posts: helpers.koMappingModel(models.Post, {
        timestamp: helpers.koMappingObject(Date),
        attachments: helpers.koMappingModel(models.Attachment)
      })
    })
    callback(thread)
  })
}

var postThread = function(boardName, post, callback) {
  var url = "/boards/" + boardName + "/threads"
  var query = {post: post}
  request.post(url).send(query).end(callback)
}

var postThreadPost = function(boardName, threadIndex, post, callback) {
  var url = "/boards/" + boardName + "/threads/" + threadIndex
  var query = {post: post}
  request.post(url).send(query).end(callback)
}

var deleteThreadPost = function(boardName, threadIndex, postIndex, callback) {
  var url = "/boards/" + boardName + "/threads/" + threadIndex + "/" + postIndex
  var query = {}
  request.del(url).send(query).end(callback)
}

var router = new helpers.Router()
var routerCallback = function(params) {
  //console.log(JSON.stringify(params))
}
router.define("#/:board", routerCallback)
router.define("#/:board/page-:page", routerCallback)
router.define("#/:board/thread-:thread", routerCallback)
router.define("#/:board/thread-:thread/post-:post", routerCallback)
// TODO: router.urlFor(path, params)

var toggleMore = false
var viewModel = {
  boards: ko.observableArray([]),
  currentBoard: ko.observable(null),

  boardPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  currentPage: ko.observable(1),

  threads: ko.observableArray([]),
  currentThread: ko.observable(null),

  activePost: ko.observable(null),
  boardPassword: ko.observable(""),

  showForm: function() {
    //$("#right-element").toggleClass("invisible")
    //$("#left-element").toggleClass("span6 span12")
    $("#form-element").toggleClass("show hide")
  },
  showMore: function() {
    $("#form-comment").attr({rows: toggleMore ? "10" : "20"})
    toggleMore = !toggleMore
  },

  refreshBoard: function(callback) {
    var params = {}
    var route = router.execute(location.hash)
    if (route) {
      params = route.params
    }

    getBoards(function(boards) {
      if (!params.board) {
        params.board = boards[0].name()
      }
      if (!params.page) {
        params.page = 1
      }

      var currentBoard = _.find(boards, function(board) {
        return board.name() === params.board
      })
      viewModel.boards(boards)
      viewModel.currentBoard(currentBoard)

      getThreads(params.board, params.page, function(threads) {
        viewModel.threads(threads)
        viewModel.currentPage(params.page)

        var activePost = new models.Post()
        viewModel.activePost(activePost)

        if (params.thread) {
          getThread(params.board, params.thread, function(currentThread) {
            viewModel.currentThread(currentThread)
            viewModel.threads([currentThread])
            if (callback) callback()
          })
        }
        else {
          viewModel.currentThread(null)
          if (callback) callback()
        }
      })
    })
  },

  createThread: function(post) {
    post.timestamp = JSON.stringify(post.timestamp()).slice(1, -1)
    post = ko.toJS(post)
    if (!viewModel.currentThread()) {
      postThread(viewModel.currentBoard().name(), post)
    }
    else {
      postThreadPost(viewModel.currentBoard().name(), viewModel.currentThread().initialPostIndex(), post)
    }

    var activePost = new models.Post()
    viewModel.activePost(activePost)
    viewModel.refreshBoard()
  },

  removePost: function(thread, post) {
    deleteThreadPost(thread.boardName(), thread.initialPostIndex(), post.index())
    viewModel.refreshBoard()
  },

  formatDate: helpers.formatDate
}

$(window).bind("hashchange", function(event) {
  //console.log("location.hash:", JSON.stringify(location.hash))
  viewModel.refreshBoard()
})

$(document).ready(function() {
  if (location.hostname === "localhost") {
    document.title = document.title + " (localhost)"
    $("#brand-subtitle").text("(localhost)")
  }

  viewModel.refreshBoard(function() {
    ko.applyBindings(viewModel)

    $("#board-element").tooltip({
      selector: "[rel='tooltip']"
    })
    $(".post").each(function() {
      var $element = $(this).find(".post-body")
      if ($element.height() > 360) {
        $element.height(360).css("overflow-y", "scroll")
      }
    })
  })
})
