//-------------------------------------
// MODULE DEPENDENCIES.
//-------------------------------------

var fs = require("fs")
var mongoose = require("mongoose")

var _ = require("underscore")
var async = require("async")
var yaml = require("js-yaml")

var Devchan = require("./app/index")
var fixtures = fs.readdirSync("./data/fixtures")
fixtures = _.select(fixtures, function(fixtureFilename) { return fixtureFilename[0] != "_" })

//-------------------------------------
// COMMAND LINE ARGUMENTS AND USAGE.
//-------------------------------------

var modelName = process.argv[2]
var fixtureFilename = process.argv[3]

if (!modelName || !fixtureFilename) {
  console.log("Usage:\n\tnode seeds <modelName> <fixtureFilename>\n")
  console.log("<modelName>:\n\t" + _.keys(Devchan.db.models).join(", ") + "\n")
  console.log("<fixtureFilename>:\n\t" + fixtures.join(", ") + "\n")
  process.exit(0)
}

//-------------------------------------
// DATA SEEDER.
//-------------------------------------

if (module === require.main) {
  console.log("Seeding model '" + modelName + "' with data from '" + fixtureFilename + "'...")

  Devchan.db.connect(function(err) {
    if (err) throw err

    var modelObject = Devchan.db.models[modelName]
    var fixtureData = require("./data/fixtures/" + fixtureFilename)
    async.forEach(fixtureData, function(dataset, callback) {
      console.log(dataset)
      new modelObject(dataset).save(callback)
    }, function(err) {
      Devchan.db.disconnect(function() {
        if (err) throw err
        process.exit(0)
      })
    })
  })
}
