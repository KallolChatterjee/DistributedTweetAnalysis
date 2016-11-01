var express = require('express');
var http = require('http');
var  ejs = require('ejs');
var bodyParser = require('body-parser');
var elasticsearch = require('elasticsearch');
var app = express();
var client = new elasticsearch.Client({
  host: 'http://55be81dc.ngrok.io/'
});
app.set('views', './views');
app.engine('html', ejs.renderFile);
app.use(express.static('./js'));
app.use(express.static('./images'));
app.use(express.static('./styles'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
http.createServer(app).listen(8086);
app.get('/', function(req, res) {
    var neutralValue;
    var negativeValue;
    var positiveValue;
      client.search({
          index: 'project_1',
          type: 'tweet',
          body: {
            size: 0,
            query: {
              match_all: {}
            },
            "aggregations":
            {
                "aggs": {
                    "terms": {
                      "field": "sentiments"
                    }
                },
                "aggs2": {
                    "terms": {
                      "field": "hashtags",
                      "size" : 10
                    }
                },
                "aggs3": {
                    "terms": {
                      "field": "mentions",
                      "size" : 10
                    }
                },
                "aggs4": {
                        "date_histogram" : {
                            "field" : "timestamp_ms",
                            "interval" : "day"
                        }
                },
                "aggs5": {
                   "terms": {
                     "field": "screen_name",
                     "size" : 10
                   }
               },
               "aggs6": {
                   "terms": {
                     "field": "text",
                     "exclude":["a","an","the","this","on","at", "and","are","is","to","these","from","of", "for","in","we","that","be","have","it","with","will","they","what","by","if","why","as","has","but"],
                     "size" : 100
                   }
               }
            }
          }
      }).then(function (resp) {
          // console.log(resp);
          neutralValue = resp.aggregations.aggs.buckets[0].doc_count;
          negativeValue = resp.aggregations.aggs.buckets[2].doc_count;
          positiveValue = resp.aggregations.aggs.buckets[1].doc_count;
          // console.log(neutralValue);
          // console.log(negativeValue);
          // console.log(positiveValue);
          /////////////////////////Top////////////////////////////////
          var hashtagArray = resp.aggregations.aggs2.buckets;
          var mentionsArray = resp.aggregations.aggs3.buckets;
          var dailyDistributionbucket = resp.aggregations.aggs4.buckets;
          var topUser = resp.aggregations.aggs5.buckets;
          var topWords = resp.aggregations.aggs6.buckets;
          /////////////////////////////////////////////////////////

          var sentimentDataArray = [];
          var title = ["sentiment", "value"];
          sentimentDataArray.push(title);
          var positiveObj = ["Positive", positiveValue];
          sentimentDataArray.push(positiveObj);
          var neutralObj = ["Neutral", neutralValue];
          sentimentDataArray.push(neutralObj);
          var negativeObj = ["Negative", negativeValue];
          sentimentDataArray.push(negativeObj);
          app.render('index.html', {
            sentimentData: JSON.stringify(sentimentDataArray),
            hashtags: JSON.stringify(hashtagArray),
            mentions : JSON.stringify(mentionsArray),
            dailyDistribution : JSON.stringify(dailyDistributionbucket),
            topUser: JSON.stringify(topUser),
            topWords: JSON.stringify(topWords)
          },function(err, renderedData) {
             res.send(renderedData);
         });
          }, function (err) {
              console.trace(err.message);
      });
});
