// notifications.js
// By Mike Kavouras
// from https://github.com/mikekavouras/notifications-js
// rev ea7aa1611e - Oct 4 2013

var Notifications = {};
Notifications.observers = {};
Notifications.addObserver = function(elems, ev) {
  if (this.observers[ev] === undefined)
    this.observers[ev] = [];
  for (var i = 0; i < elems.length; i++) {
    this.observers[ev].push(elems[i]);
  }
};
Notifications.removeObserver = function(elems, ev) {
  if (this.observers[ev] === undefined) return;
  var arr = this.observers[ev];
  var n = this;
  var remove = function(arr, elems) {
    if (arr.length === 0) {
      delete n.observers[ev];
      return;
    }
    for (var i = 0; i < elems.length; i++) {
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] === elems[i]) {
          arr.splice(j,1);
          remove(arr, elems);
        }
      }
    }
  };
  remove(arr, elems);
};
Notifications.trigger = function(ev, params) {
  if (Notifications.observers[ev] === undefined) return;
  var elems = Notifications.observers[ev];
  for (var i = 0; i < elems.length; i++) {
    $(elems[i]).trigger(ev, params);
  }
};
Notifications.clearAll = function() {
  this.observers = {};
};
