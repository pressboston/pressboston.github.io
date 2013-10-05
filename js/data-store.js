var DataStore = {};

DataStore.prime = function(proxy, scope, members) {
  var storage = {};
  if (typeof(Storage) !== "undefined") {
    storage = sessionStorage;
  }

  _(members).each(function (v, k) {
    var scopedK = scope + ':' + k;
    var serialized = storage[scopedK];
    if (serialized) {
      proxy[k] = JSON.parse(serialized);
    } else {
      proxy[k] = v;
    }
  });
};

DataStore.sync = function(proxy, scope) {
  var storage = {};
  if (typeof(Storage) !== "undefined") {
    storage = sessionStorage;
  } else {
    return;
  }

  _(proxy).each(function (v, k) {
    var scopedK = scope + ':' + k;
    storage[scopedK] = JSON.stringify(v);
  });
};
