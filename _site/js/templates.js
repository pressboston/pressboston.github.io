var Templates = {};

Templates.require = function(group, templates, success) {
  var paths = [];
  var loaded = {};
  var trysuccess = function() {
    var i = 0;
    for (i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      if (!loaded[tpl]) return;
    }
    success();
  };

  var make_cb = function(tpl) {
    return function(data) {
      var compiled = Mustache.compile(data);
      Templates[tpl] = compiled;
      loaded[tpl] = compiled;
      trysuccess();
    };
  };

  var i = 0;
  for (i = 0; i < templates.length; i++) {
    var tpl = templates[i];
    var path = 'js/templates/' + group + '/' + tpl + '.mustache';
    paths.push(path);
    $.get(path, make_cb(tpl));
  }
};

