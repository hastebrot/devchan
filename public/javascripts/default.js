
var getBoards = function() {
  var query = {}
  var data = helpers.jsonRequest("get", "/boards", query).data
  var boards = _.collect(data.docs, function(doc) {
    return new models.Board(doc)
  })
  return boards
}

var getThreads = function(query) {
  query = query || {}
  //var data = helpers.jsonRequest("get", "/threads-generated.json", query).data
  var data = helpers.jsonRequest("get", "/threads", query).data
  var threads = _.collect(data.docs, function(doc) {
    return new models.Thread(doc, {
      lastTimestamp: helpers.koMappingObject(Date),
      posts: helpers.koMappingModel(models.Post, {
        timestamp: helpers.koMappingObject(Date),
        attachments: helpers.koMappingModel(models.Attachment)
      })
    })
  })
  return threads
}

var getThread = function(query) {
  query = query || {}
  var data = helpers.jsonRequest("get", "/thread", query).data
  console.log(data.doc)
  var thread = new models.Thread(data.doc, {
    lastTimestamp: helpers.koMappingObject(Date),
    posts: helpers.koMappingModel(models.Post, {
      timestamp: helpers.koMappingObject(Date),
      attachments: helpers.koMappingModel(models.Attachment)
    })
  })
  return thread
}

var postThread = function(board, post) {
  var query = {board: board, post: post}
  var response = helpers.jsonRequest("post", "/threads", query)
  return response
}

var postPost = function(board, thread, post) {
  var query = {board: board, thread: thread, post: post}
  var response = helpers.jsonRequest("post", "/posts", query)
  return response
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

  showForm: function() {
    //$("#right-element").toggleClass("invisible")
    //$("#left-element").toggleClass("span6 span12")
    $("#form-element").toggleClass("show hide")
  },
  showMore: function() {
    $("#form-comment").attr({rows: toggleMore ? "10" : "20"})
    toggleMore = !toggleMore
  },

  refreshBoard: function() {
    var params = {}

    var route = router.execute(location.hash)
    if (route) {
      params = route.params
    }

    var boards = getBoards()
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

    var threads = getThreads({
      boardName: params.board,
      pageIndex: params.page
    })
    viewModel.threads(threads)
    viewModel.currentPage(params.page)

    var activePost = new models.Post()
    viewModel.activePost(activePost)

    viewModel.currentThread(null)
    if (params.thread) {
      var currentThread = getThread({
        boardName: params.board,
        threadIndex: params.thread
      })
      viewModel.currentThread(currentThread)
      viewModel.threads([currentThread])
    }
  },

  createThread: function(post) {
    post.timestamp = JSON.stringify(post.timestamp()).slice(1, -1)
    post = ko.toJS(post)
    if (!viewModel.currentThread()) {
      postThread(viewModel.currentBoard(), post)
    }
    else {
      console.log("postPost")
      postPost(viewModel.currentBoard(), viewModel.currentThread(), post)
      console.log(post)
    }

    var activePost = new models.Post()
    viewModel.activePost(activePost)
    viewModel.refreshBoard()
  },
  formatDate: formatDate
}

$(window).bind("hashchange", function(event) {
  //console.log("location.hash:", JSON.stringify(location.hash))
  viewModel.refreshBoard()
})

$(document).ready(function() {
  viewModel.refreshBoard()
  ko.applyBindings(viewModel)

  $(".post").each(function() {
    $element = $(this).find(".post-body")
    if ($element.height() > 360) {
      $element.height(360).css("overflow-y", "scroll")
    }
  })
})
