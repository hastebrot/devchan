
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

var deleteThreadPost = function(boardName, threadIndex, postIndex, password, callback) {
  var url = "/boards/" + boardName + "/threads/" + threadIndex + "/" + postIndex
  var query = password ? {password: password} : {}
  request.del(url).send(query).end(callback)
}

var router = new helpers.Router()
var routerCallback = function(params) {
  //console.log(JSON.stringify(params))
}
router.define("#!/:board", routerCallback)
router.define("#!/:board/page-:page", routerCallback)
router.define("#!/:board/thread-:thread", routerCallback)
router.define("#!/:board/thread-:thread/post-:post", routerCallback)
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
    toggleMore = !toggleMore
    $("#form-comment-tabs .resizable-element").css("height", !toggleMore ? 120 : 240)
  },

  commentPost: function(thread, post) {
    location.hash = "#!/" + thread.boardName() + "/thread-" + thread.initialPostIndex()
    if (!$("#button-comment").hasClass("active")) {
      setTimeout(function() {
        $("#button-comment").click()
      }, 350)
    }
  },
  citePost: function(thread, post) {
    var hashUrl = "#!/" + thread.boardName() + "/thread-" + thread.initialPostIndex()
    location.hash = hashUrl
    hashUrl = hashUrl + "/post-" + post.index()

    var text = $("<p/>").html(post.commentHtml()).text()
    text = text.replace(/\s+/g, " ")
    text = text.length > 65 ? text.slice(0, 65).trim() + "..." : text
    text = "> [>>" + post.index() + "](" + hashUrl + ") " + text + "\n"

    var currentText = viewModel.activePost().commentPlain()
    currentText = currentText.length > 0 ? currentText + "\n" : currentText
    viewModel.activePost().commentPlain(currentText + text)
    if (!$("#button-comment").hasClass("active")) {
      setTimeout(function() {
        $("#button-comment").click()
      }, 350)
    }
  },

  refreshBoard: function(callback) {
    $("#form-comment-tabs .resizable-element").css("height", !toggleMore ? 120 : 240)

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

        if (params.thread) {
          getThread(params.board, params.thread, function(currentThread) {
            viewModel.currentThread(currentThread)
            viewModel.threads([currentThread])

            viewModel.refreshBoardFinish()
            if (typeof(callback) === "function") callback()
          })
        }
        else {
          viewModel.currentThread(null)

          viewModel.refreshBoardFinish()
          if (typeof(callback) === "function") callback()
        }
      })
    })
  },
  refreshBoardFinish: function() {
    $("#board-element").tooltip({
      selector: "[rel='tooltip']"
    })
    $(".thread .post").each(function() {
      var $element = $(this).find(".post-body")
      if ($element.height() > 360) {
        $element.height(360).css("overflow-y", "scroll")
      }
    })

    $(".thread .post pre code").each(function() {
      var $element = $(this)
      var codeLanguagePattern = /lang-(.+)/
      var codeLanguageClasses = $element.attr("class") || ""
      var codeLanguageClass = codeLanguageClasses.match(codeLanguagePattern) || []
      var codeLanguage = codeLanguageClass[0] || ""
      var aliases = {
        php: "text/x-php",
        java: "text/x-java",
        html: "text/html",
        sql: "text/x-mysql",
        json: "application/json"
      }
      codeLanguage = aliases[codeLanguage] || codeLanguage
      CodeMirror.runMode($element.text(), codeLanguage, this)
      $element.addClass("cm-s-default")
    })

    if (!viewModel.activePost() || !viewModel.currentThread()) {
      var activePost = new models.Post()
      viewModel.activePost(activePost)
      if ($("#button-comment").hasClass("active")) {
        $("#button-comment").click()
      }
    }
  },

  createThread: function(post) {
    post.timestamp = JSON.stringify(post.timestamp()).slice(1, -1)
    post = ko.toJS(post)
    if (!viewModel.currentThread()) {
      postThread(viewModel.currentBoard().name(), post, function(res) {
        var activePost = new models.Post()
        viewModel.activePost(activePost)
        viewModel.refreshBoard()
        $("#button-comment").click()
      })
    }
    else {
      postThreadPost(viewModel.currentBoard().name(), viewModel.currentThread().initialPostIndex(), post, function() {
        var activePost = new models.Post()
        viewModel.activePost(activePost)
        viewModel.refreshBoard()
        $("#button-comment").click()
      })
    }
  },

  removePost: function(thread, post) {
    var password = viewModel.boardPassword()
    deleteThreadPost(thread.boardName(), thread.initialPostIndex(), post.index(), password, function(res) {
      console.log(res)
      if (res.ok) {
        if (thread.initialPostIndex() === post.index()) {
          location.hash = "#!/" + thread.boardName()
        }
        viewModel.refreshBoard()
      }
    })
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
    viewModel.refreshBoardFinish()
  })
})
