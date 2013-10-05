var imgloader =  "<img class='loader' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />";
var doneloader =  "<img class='loader done' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />";

var Loader = {
  show: function(msg) {
    var formattedMsg = (msg && msg !== "" ?
                        "<span class='load'>("+msg+")</span> " :
                        "");
    $("h1 #loader_zone").html(formattedMsg + imgloader);
  },

  hide: function() {
    $("h1 #loader_zone").html(doneloader);
  }
};

Loader.hide();
