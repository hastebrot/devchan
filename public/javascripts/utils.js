
var formatDate = function(date) {
  var fill = function(number, pattern) { 
    return (pattern + number).slice(-pattern.length)
  }
  var day = date.getDate(), month = date.getMonth() + 1, year = date.getYear() + 1900
  var hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds()
  var milliseconds = date.getMilliseconds()
  return fill(day, "00") + "." + fill(month, "00") + "." + fill(year, "0000") + " " 
    + fill(hour, "00") + ":" + fill(minute, "00") + ":" + fill(second, "00") + "."
    + fill(milliseconds, "000")
}

ko.bindingHandlers["textws"] = {
  update: function(element, valueAccessor) {
    var valueAccessorWs = function() {
      var value = valueAccessor() || ""
      var whitespace = " "  
      return whitespace + value + whitespace
    }
    ko.bindingHandlers["text"].update(element, valueAccessorWs)
  }
}
