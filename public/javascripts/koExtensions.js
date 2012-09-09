//-------------------------------------
// KNOCKOUT EXTENSIONS.
//-------------------------------------

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
