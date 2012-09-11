
var expect = require("chai").expect
var passwordHash = require("password-hash")
var marked = require("marked")

describe("passwordHash", function() {
  var password = "password123"
  var wrongPassword = "password456"
  var hashedPassword1 =  passwordHash.generate(password)
  var hashedPassword2 =  passwordHash.generate(password)

  it("should verify password", function() {
    expect(passwordHash.verify(password, hashedPassword1)).to.be.ok
    expect(passwordHash.verify(wrongPassword, hashedPassword1)).to.be.not.ok
    expect(passwordHash.verify(password, hashedPassword2)).to.be.ok
    expect(passwordHash.verify(wrongPassword, hashedPassword2)).to.be.not.ok
  })

  it("should change salt string", function() {
     expect(hashedPassword1).to.not.equal(hashedPassword2)
  })
})

describe("marked", function() {
  var markdownText = "This is a **test**."
  var htmlText = "<p>This is a <strong>test</strong>.</p>\n"

  it("should represent html", function() {
    marked.setOptions({gfm: true, pedantic: false, sanitize: true})
    expect(marked(markdownText)).to.equal(htmlText)
  })
})
