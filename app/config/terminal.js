//-----------------------------------------------------------------------------
// MODULE DEPENDENCIES.
//-----------------------------------------------------------------------------

var repl = require("repl")

//-----------------------------------------------------------------------------
// DEVCHAN SHELL.
//-----------------------------------------------------------------------------

var inspectArgs = function(args) {
  var argsLength = args.length
  var message = "Callback called with " + argsLength + " "  +
    ((argsLength === 1) ? "argument" : "arguments") + ".\n"
  for (var index = 0; index < argsLength; index += 1) {
    var argIdentifier = "_" + index
    message += argIdentifier + " = " + args[index] + "\n"
  }
  return message
}

exports.start = function(prompt, variables) {
  var context = repl.start(prompt).context

  context.reload = function() {
    for (var variable in variables) {
      context[variable] = variables[variable]
    }
  }
  
  context.c = function() {
    for (var index = 0; index <= 9; index += 1) {
      var argIdentifier = "_" + index
      if (index < arguments.length) {
        context[argIdentifier] = arguments[index]
      }
      else if (context.hasOwnProperty(argIdentifier)) {
        delete context[argIdentifier]
      }
    }
    context.console.log(inspectArgs(arguments))
  }
  
  context.exit = function() {
    process.exit(0)
  }
  
  process.nextTick(context.reload)
}
