
var Devchan = require("../../app/index.js")
var expect = require("chai").expect

var boardSchema = Devchan.db.models.Board.schema
var threadSchema = Devchan.db.models.Thread.schema
var postSchema = Devchan.db.models.Thread.schema.paths.posts.schema

describe("Schema Board", function() {
  describe("#paths", function() {
    it("should have field name", function() {
      expect(boardSchema.paths).to.have.property("name")
    })

    it("should have field description", function() {
      expect(boardSchema.paths).to.have.property("description")
    })

    it("should have field currentPostIndex", function() {
      expect(boardSchema.paths).to.have.property("currentPostIndex")
    })
  })

  describe("#statics", function() {
    it("should have method allocatePostIndex", function() {
      expect(boardSchema.statics).to.have.property("allocatePostIndex")
    })
  })
})

describe("Schema Thread", function() {
  describe("#paths", function() {
    it("should have field boardName", function() {
      expect(threadSchema.paths).to.have.property("boardName")
    })

    it("should have field lastTimestamp", function() {
      expect(threadSchema.paths).to.have.property("lastTimestamp")
    })

    it("should have field initialPostIndex", function() {
      expect(threadSchema.paths).to.have.property("initialPostIndex")
    })
  })
})

describe("Schema Post", function() {
  describe("#paths", function() {
    it("should have field index", function() {
      expect(postSchema.paths).to.have.property("index")
    })

    it("should have field timestamp", function() {
      expect(postSchema.paths).to.have.property("timestamp")
    })

    it("should have field name", function() {
      expect(postSchema.paths).to.have.property("name")
    })

    it("should have field subject", function() {
      expect(postSchema.paths).to.have.property("subject")
    })

    it("should have field commentPlain", function() {
      expect(postSchema.paths).to.have.property("commentPlain")
    })

    it("should have field commentHtml", function() {
      expect(postSchema.paths).to.have.property("commentHtml")
    })

    it("should have field sage", function() {
      expect(postSchema.paths).to.have.property("sage")
    })

    it("should have field passwordEncrypted", function() {
      expect(postSchema.paths).to.have.property("passwordEncrypted")
    })

    it("should have field attachments", function() {
      expect(postSchema.paths).to.have.property("attachments")
    })
  })
})
