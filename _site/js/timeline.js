// Hack the Timeline into this global var >_<
var Timeline = null;

$.embedly.defaults.key = '222d9be7d2dc4921b4decf3cc74ed2dd';
$.embedly.defaults.batch = 10;
$.embedly.defaults.query = {
  words: 35
};

(function($) {
    var pagesFetched = 0;

    var $window = $(window);
    var $tl = null;
    var $loader = null;
    var $scroller = null;

    var storage = {};
    DataStore.prime(storage, 'timeline', {rounds: []});

    var tlData = function() {
      var tl = {
        timeline: {
          headline: "Rounds Raised in Boston",
          type: 'default',
          date: [
          ]
        }
      };

      for (var i = 0; i < storage.rounds.length; i++) {
        var round = storage.rounds[i];
        round.amount_formatted = (round.amount > 0 ?
                                  "$" + CurrencyTools.wordize(round.amount) :
                                  "Undisclosed");
        round.has_participants = round.participants.length > 0;
        var startDate = round.closed_at;
        var matches = startDate.match(/(\d\d\d\d)-(\d\d)-(\d\d)/);
        startDate = matches[2] + "/" + matches[3] + "/" + matches[1] + " 0:00:00";
        var roundDate = {
            "startDate":startDate,
            "headline": Templates.headline(round),
            "text":Templates.round(round),
            "asset": {
                "media":(round.source_url ?
                         round.source_url :
                         round.startup.logo_url),
                "thumbnail":round.startup.thumb_url,
                "type": "twitter"
            }
        };
        if (round.startup.name && round.startup.name !== "") {
          tl.timeline.date.push(roundDate);
        }
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

    var fetchRounds = function() {
      if (storage.rounds.length > 0) {
        startTimeline();
        return;
      }

      Angellist.fetchRounds(function (percent) {
          Loader.show(percent + " Loaded");
        },
        function (loaded) {
          storage.rounds = loaded;
          Loader.hide();
          DataStore.sync(storage, 'timeline');

          startTimeline();
        });
    };

    var startTimeline = function() {
      var otherStuffHeight = $("#nav_zone").outerHeight(true) + $('#footer').outerHeight(true) + 40;

      $('#timeline-embed').empty();
      var storyJs = createStoryJS({
          type:       'timeline',
          width:      '100%',
          height:     '100%',
          source:     tlData(),
          embed_id:   'timeline-embed',
          start_at_end:       true,
          start_zoom_adjust:  3
      });
      var $container = $('#timeline_ctr');
      $container.height($window.height() - otherStuffHeight);
      $window.resize(function(e) {
          $container.height($window.height() - otherStuffHeight);
      });
    };

    $(document).ready(function(e) {
        $tl = $('ul#tl');
        Templates.require('timeline', ['headline', 'round', 'embedly'],
                          fetchRounds);
    });
}(jQuery));
