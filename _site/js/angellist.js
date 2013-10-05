var Angellist = {
  apiRoot: 'https://api.angel.co/1/'
};

Angellist.apiUrl = function(method) {
  return Angellist.apiRoot + method + '?callback=?';
};

Angellist.formatPercent = function(pagenum, lastPage) {
  var percent = (lastPage === 0 ?
                 "0%" :
                 (100.0 * (pagenum - 1) / lastPage).toFixed(0) + "%");
  return percent;
};

Angellist.fetchRounds = function(progress, completion) {
    var rounds = [];
    var pagesFetched = 0;
    var lastPage = 0;
    var fetchReq = null;

    var fetchPage = function(pagenum) {
      var apiUrl = Angellist.apiUrl('funding');

      if (fetchReq) return;

      var percent = Angellist.formatPercent(pagenum, lastPage);
      Notifications.trigger("Angellist.fetchPage.progress", percent);
      if (progress) {
        progress(percent);
      }

      fetchReq = $.getJSON(apiUrl, {tag_ids: '116110', page: pagenum},
        function(data) {
          fetchReq = null;

          if (data.page > data.last_page) return;

          rounds = rounds.concat(data.funding);
          pagesFetched = data.page;
          lastPage = data.last_page;

          if (data.page === data.last_page) {
            Notifications.trigger("Angellist.fetchPage.completion", rounds);
            if (completion) {
              completion(rounds);
            }
          } else {
            fetchPage(pagesFetched + 1);
          }
        }
      );
    };

    fetchPage(1);
};

Angellist.startupBatch = function(ids, progress, completion) {
  var startLen = ids.length;
  var batchSize = 25;
  var pagenum = 1;
  var numPages = Math.ceil(1.0 * startLen / batchSize);

  var startups = {};

  var idsRemaining = ids;
  var fetchReq = null;

  var fetchSlice = function() {
    if (idsRemaining.length === 0) {
      Notifications.trigger("Angellist.startupBatch.completion", startups);
      if (completion) {
        completion(startups);
      }

      return;
    }

    var percent = Angellist.formatPercent(pagenum, numPages);
    Notifications.trigger("Angellist.startupBatch.progress", percent);
    if (progress) {
      progress(percent);
    }

    var idSlice = idsRemaining.splice(0, batchSize);

    $.getJSON(Angellist.apiUrl('startups/batch'), {ids: idSlice.join(',')},
      function(data) {
        pagenum++;
        for (var i = 0; i < data.length; i++) {
          var startup = data[i];
          startups[startup.id] = startup;
        }

        fetchSlice();
      });
  };

  fetchSlice();
};
