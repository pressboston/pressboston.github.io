var Templates = {};

var require_templates = function(group, templates, success) {
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

(function($) {
    var rounds = [];
    var pagesFetched = 0;

    var $window = $(window);
    var $tl = null;
    var $loader = null;
    var $scroller = null;

    var tlData = function() {
      var tl = {
        timeline: {
          headline: "Rounds Raised in Boston",
          type: 'default',
          date: [
          ]
        }
      };

      for (var i = 0; i < rounds.length; i++) {
        var round = rounds[i];
        round.amount_formatted = (round.amount > 0 ?
                                  "$" + CurrencyTools.wordize(round.amount) :
                                  "Undisclosed");
        round.has_participants = round.participants.length > 0;
        var startDate = round.closed_at;
        var matches = startDate.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
        startDate = matches[2] + "/" + matches[3] + "/" + matches[1] + " 0:00:00";
        console.log(startDate);
        console.log(round);
        var roundDate = {
            "startDate":startDate,
            "headline": Templates.headline(round),
            "text":Templates.round(round),
            "asset": {
                "media":(round.source_url ?
                         round.source_url :
                         round.startup.logo_url),
                "thumbnail":round.startup.thumb_url
            }
        };
        tl.timeline.date.push(roundDate);
      }

      return tl;
    };

    var renderRounds = function(roundsChunk) {
      var html = '';
      for (var i = 0; i < roundsChunk.length; i++) {
        var round = roundsChunk[i];
        html += Templates.round(round);
      }
      $tl.append(html);
    };

    var fetchReq = null;
    var fetchPage = function(pagenum) {
      var apiUrl = 'https://api.angel.co/1/funding?callback=?';

      if (fetchReq) return;

      $("h1").html("PressBoston - Loading...");

      fetchReq = $.getJSON(apiUrl, {tag_ids: '116110', page: pagenum},
        function(data) {
          fetchReq = null;

          if (data.page > data.last_page) return;

          rounds = rounds.concat(data.funding);
          pagesFetched = data.page;

          if (data.page === data.last_page) {
            $("h1").html("PressBoston");

            $('#timeline-embed').empty();
            createStoryJS({
                type:       'timeline',
                width:      '100%',
                height:     '600',
                source:     tlData(),
                embed_id:   'timeline-embed',
                start_at_end:       true,
                start_zoom_adjust:  3,
                font:               'Helvetica'
            });
          } else {
            fetchPage(pagesFetched + 1);
          }
        }
      );
    };

    $(document).ready(function(e) {
        $tl = $('ul#tl');
        $("h1").html("PressBoston - Loading Templates...");
        require_templates('timeline', ['headline', 'round'], function() {
          fetchPage(1);
        });
    });
}(jQuery));