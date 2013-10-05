(function($) {
  var storage = {};
  DataStore.prime(storage, 'markets', {
    rounds: {},
    startups: {},
    startupRounds: {},
    markets: {},
    marketRounds: {},
    marketList: []
  });

////////////////////////////////////////////////////////////////////////////////
// Data
////////////////////////////////////////////////////////////////////////////////

  var amountRaisedForStartup = function(id) {
    return _.reduce(storage.startups[id].rounds, function(memo, roundId) {
      var round = storage.rounds[roundId];
      return round.round_type === "Acquired" ? 0 : memo + round.amount;
    }, 0);
  };

  var fetchRounds = function() {
    if (Object.keys(storage.rounds).length) {
      fetchStartups();
      return;
    }

    Angellist.fetchRounds(
      function(percent) {
        Loader.show("Loading dataset 1 of 2 - " + percent);
      },
      function(loaded) {
        for (var i = 0; i < loaded.length; i++) {
          var round = loaded[i];
          storage.rounds[round.id] = round;

          var savedStartup = storage.startups[round.startup.id];
          if (savedStartup) {
            storage.startupRounds[savedStartup.id].push(round.id);
          } else {
            var startup = round.startup;
            storage.startupRounds[startup.id] = [round.id];
            storage.startups[startup.id] = startup;
          }
        }

        DataStore.sync(storage, 'markets');

        fetchStartups();
      });
  };

  var fetchStartups = function() {
    var startupIds = Object.keys(storage.startups);
    if (startupIds.length &&
        storage.startups[startupIds[0]].markets) {
      prepareMarkets();
      return;
    }

    Angellist.startupBatch(
      Object.keys(storage.startups),
      function(percent) {
        Loader.show("Loading dataset 2 of 2 - " + percent);
      },
      function(loaded) {
        $.extend(storage.startups, loaded);
        DataStore.sync(storage, 'markets');
        prepareMarkets();
      });
  };

  var prepareMarkets = function() {
    if (storage.marketList.length && Object.keys(storage.markets).length) {
      Loader.hide();
      renderMarkets();
      return;
    }

    var marketList = [];
    _(storage.startups).each(function(startup, id) {
      if (startup.markets) {
        for (var i = 0; i < startup.markets.length; i++) {
          var market = startup.markets[i];

          var amountRaised = 0;
          var newMarketRoundIds = [];

          var startupRounds = storage.startupRounds[id];
          for (var j = 0; j < startupRounds.length; j++) {
            var roundId = startupRounds[j];
            var round = storage.rounds[roundId];
            if (round.round_type === "Acquired") return;

            amountRaised += round.amount;
            newMarketRoundIds.push(roundId);
          }

          if (storage.markets[market.id]) {
            var savedMarket = storage.markets[market.id];
            savedMarket.amountRaised += amountRaised;
            savedMarket.startup_ids.push(id);
            storage.marketRounds[market.id] =
                storage.marketRounds[market.id].concat(newMarketRoundIds);
          } else {
            market.amountRaised = amountRaised;
            market.startup_ids = [id];
            storage.marketRounds[market.id] = newMarketRoundIds;
            storage.markets[market.id] = market;
            marketList.push(market);
          }
        }
      }
    });

    marketList = _(marketList).chain().filter(function(market) {
      return market.startup_ids.length > 1;
    }).sortBy(function(market) {
      return -1 * market.amountRaised;
    }).map(function(market) {
      market.amount_formatted = (market.amountRaised > 0 ?
                                 "$" + CurrencyTools.wordize(market.amountRaised) :
                                 "N/A");
      return market;
    }).value();

    storage.marketList = marketList;

    Loader.hide();
    DataStore.sync(storage, 'markets');
    renderMarkets();
  };

  var $list = $("#list");
  var renderMarkets = function() {
    $list.html(Templates.marketList({markets: storage.marketList}));
  };

////////////////////////////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////////////////////////////
  var $body = $('body');
  var $window = $(window);
  var $detail = $('#detail');
  var $detailContainer = $('#detail_container');

  var detailMarket = function($a) {
    $('#list li a.current').removeClass('current');
    $a.addClass('current');
    $detail.addClass('populated');

    var marketId = $a.attr('data-market-id');
    var market = storage.markets[marketId];
    market.rounds =
      _(storage.marketRounds[marketId]).chain().map(function(rid) {
        var round = storage.rounds[rid];
        round.amount_formatted = (round.amount > 0 ?
                                 "$" + CurrencyTools.wordize(round.amount) :
                                 "Undisclosed");
        return round;
      }).sortBy(function(round) {
        return -1 * Date.parse(round.closed_at);
      }).value();

    $detailContainer.html(Templates.marketDetail(market));
  };

  $body.delegate('#list li a', 'click', function(e) {
    var $a = $(e.currentTarget);
    if ($a.hasClass('current')) return;

    detailMarket($a);
  });

  $(document).ready(function() {
    Templates.require('markets', ['marketList', 'marketDetail'], function() {
      fetchRounds();
    });
  });
}(jQuery));
