/*globals jQuery:true, Mustache:true, CurrencyTools:true*/
var Templates = {};

var require_templates = function(group, templates, success) {
  var paths = [];
  var loaded = {};
  var trysuccess = function() {
    var i = 0;
    for (i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      if (!loaded[tpl]) { return;}
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
    jQuery.get(path, make_cb(tpl));
  }
};

var imgloader =  "<img class='loader' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />";
var doneloader =  "<img class='loader done' src='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' />";

(function($) {
    // SETS UP EMBEDLY
    $.embedly.defaults.key = '222d9be7d2dc4921b4decf3cc74ed2dd';
    $.embedly.defaults.batch = 10;
    $.embedly.defaults.query = {
      words: 35
    };

    var rounds = [];
    var urls = {};
    var pagesFetched = 0;

    var $window = $(window);
    var $tl = null;
    var $loader = null;
    var $scroller = null;

    var getAsset = function(round) {
      // Grab the url data.
      var urlData = urls[round.source_url];

      // Default Case.
      var asset = {
        "thumbnail": round.startup.thumb_url,
        "media": round.source_url
      };

      // Grabs the
      if (urlData && urlData.thumbnail_url) {
        asset.media =  urlData.thumbnail_url;
        asset.credit = '<a href="'+urlData.original_url+'" target="_blank">'+urlData.provider_name+'</a>';
        asset.caption = urlData.description;
      }
      return asset;
    };


    var tlData = function() {
      var tl = {
        timeline: {
          headline: "Rounds Raised in Boston",
          type: 'default',
          date: [
          ]
        }
      };

      $.each(rounds, function(i, round){
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
            "asset": getAsset(round)
        };
        if (round.startup.name && round.startup.name !== "") {
          tl.timeline.date.push(roundDate);
        }
      });

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

    var total = null,
      loadCount = 0,
      doneCount = 20,
      fetchReq = null;

    // Updates loading.
    var updateLoading = function(){
      var percent = '0%';
      if (total !== null){
        loadCount ++;
        percent = (100.0 * loadCount / total).toFixed(0) + "%";
      }
      $("h1").html("PressBoston <span class='load'>("+percent+" Loaded)</span> " + imgloader);
    };

    // Decides to load the timeline.
    var loadTimeline = function(num){
      doneCount += num;

      if (total > doneCount){
        return false;
      }

      $("h1").html("PressBoston " + doneloader);

      $('#timeline-embed').empty();
      window.createStoryJS({
          type:       'timeline',
          width:      '100%',
          height:     '600',
          source:     tlData(),
          embed_id:   'timeline-embed',
          start_at_end:       true,
          start_zoom_adjust:  3,
          font:               'Helvetica'
      });

    };


    var fetchPage = function(pagenum) {
      var apiUrl = 'https://api.angel.co/1/funding?callback=?';

      if (fetchReq) { return;}

      fetchReq = $.getJSON(apiUrl, {tag_ids: '116110', page: pagenum},
        function(data) {
          total = data.total;

          // Starts grabbing Embedly data.
          $.embedly.oembed($.map(data.funding, function(f){ return f.source_url;}), {})
            .progress(function(data){
              // Throws them all into urls data.
              urls[data.original_url] = data;
              updateLoading();
            })
            // notify's when this round is all done.
            .done(function(results){
              loadTimeline(results.length);
            });

          fetchReq = null;

          if (data.page > data.last_page) { return;}

          rounds = rounds.concat(data.funding);
          pagesFetched = data.page;

          // Fetch More pages.
          if (data.page !== data.last_page) {
            fetchPage(pagesFetched + 1);
          }
        }
      );
    };

    $(document).ready(function(e) {
        $tl = $('ul#tl');
        $("h1").html("PressBoston <span class='load'>(Loading Templates)</span> " + imgloader);
        require_templates('timeline', ['headline', 'round'], function() {
          fetchPage(1);
        });
    });
}(jQuery));
