var models = exports = {}

;(function(exports) {

  exports.Board = function(data, mapping) {
    var self = this
    self.name = ko.observable("")
    self.description = ko.observable("")
    self.href = ko.computed(function() {
      return "#/" + self.name()
    })
    helpers.koCopy(data, self, mapping)
  }

  exports.Thread = function(data, mapping) {
    var self = this
    self.boardName = ko.observable("")
    self.lastTimestamp = ko.observable(new Date())
    self.initialPostIndex = ko.observable(0)
    self.posts = ko.observableArray([])
    self.countPosts = ko.computed(function() {
      return self.posts().length
    })
    self.href = ko.computed(function() {
      return "#/" + self.boardName() + "/thread-" + self.initialPostIndex()
    })
    helpers.koCopy(data, self, mapping)
  }

  exports.Post = function(data, mapping) {
    var self = this
    self.index = ko.observable(0)
    self.timestamp = ko.observable(new Date())
    self.name = ko.observable("")
    self.subject = ko.observable("")
    self.commentPlain = ko.observable("")
    self.commentHtml = ko.observable("")
    self.sage = ko.observable(false)
    self.password = ko.observable("")
    self.attachments = ko.observableArray([])
    self.hrefPart = function(isPrimary) {
      if (isPrimary) { return "" }
      return "/post-" + self.index()
    }
    helpers.koCopy(data, self, mapping)
  }

  exports.Attachment = function(data, mapping) {
    var self = this
    self.index = ko.observable(0)
    self.filename = ko.observable("")
    self.filetype = ko.observable("")
    self.filesize = ko.observable("")
    self.imagesize = ko.observable("")
    helpers.koCopy(data, self, mapping)
  }

})(exports)
