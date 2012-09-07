var helpers = exports = {};

(function(exports) {

  exports.koCopy = function(source, target, mapping) {
    var copy = ko.mapping.fromJS(ko.toJS(source || {}), mapping || {}, target || {})
    if (source && source.__ko_mapping__ === undefined) {
      delete copy.__ko_mapping__
    }
    return copy
  }

// http://knockoutjs.com/documentation/plugins-mapping.html
  exports.koMappingFunction = function(callback) {
    var _callback = function(options) {
      return callback(options.data)
    }
    return {create: _callback, update: _callback}
  }

  exports.koMappingModel = function(modelType, mapping) {
    return exports.koMappingFunction(function(data) {
      return new modelType(data, mapping || {})
    })
  }

  exports.koMappingObject = function(constructorType) {
    return exports.koMappingFunction(function(data) {
      if (constructorType === Date) {
        return new Date(Date.parse(data))
      }
      throw new Error("Type " + constructorType + " not supported.")
    })
  }

  // http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  exports.koCompare = function(object1, object2) {
    //return ko.toJSON(object1) === ko.toJSON(object2)
    return _.isEqual(ko.toJS(object1), ko.toJS(object2))
  }

  /*
   * var params1 = {username: "vincent.vega", password: ""}
   * var response1 = jsonRequest("post", "/sitzungen", params1)
   */
  exports.jsonRequest = function(actionVerb, methodUrl, params) {
    var response = $.ajax({
      type: actionVerb,
      url: methodUrl,
      data: params,
      //contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false
    })
    return {
      status: response.status,
      data: $.parseJSON(response.responseText)
    }
  }

  exports.Router = function() {
    var self = this

    self.definitions = []
    self.define = function(path, callback) {
      self.definitions.push({path: path, callback: callback})
    }

    self.execute = function(path) {
      for (var index = 0; index < self.definitions.length; index += 1) {
        var definition = self.definitions[index]
        var route = new exports.Route(definition.path)
        if (route.match(path)) {
          definition.callback(route.params)
          return route
        }
      }
      return null
    }
  }

  // https://github.com/visionmedia/express/blob/master/lib/router/route.js
  exports.Route = function(path, options) {
    options = options || {}
    this.path = path
    this.keys = []
    this.regexp = exports.pathRegexp(path, this.keys,
      options.sensitive, options.strict)
    this.params = {}
  }
  exports.Route.prototype.match = function(path) {
    this.params = {}

    var match = this.regexp.exec(path)
    if (!match) return false

    for (var index = 1, len = match.length; index < len; index++) {
      var key = this.keys[index - 1]
      var val = typeof(match[index]) === "string" ?
        decodeURIComponent(match[index]) : match[index]

      var paramKey = key ? key.name : index
      this.params[paramKey] = val
    }
    return true
  }

  // https://github.com/visionmedia/express/blob/master/lib/utils.js
  exports.pathRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path
    if (Array.isArray(path)) path = "(" + path.join("|") + ")"
    path = path
      .concat(strict ? "" : "/?")
      .replace(/\/\(/g, "(?:/")
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star) {
        keys.push({name: key, optional: !!optional})
        slash = slash || ""
        return ""
          + (optional ? "" : slash)
          + "(?:"
          + (optional ? slash : "")
          + (format || "") + (capture || (format && "([^/.]+?)" || "([^/]+?)")) + ")"
          + (optional || "")
          + (star ? "(/*)?" : "")
      })
      .replace(/([\/.])/g, "\\$1")
      .replace(/\*/g, "(.*)")
    return new RegExp("^" + path + "$", sensitive ? "" : "i")
  }

  // http://stackoverflow.com/a/2593661/371964
  exports.quoteRegexp = function(string) {
    return ("" + string).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
  }

})(exports)
