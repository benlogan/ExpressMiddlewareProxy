var request = require('request');
var express = require('express');
//var proxy = require('express-http-proxy');
var proxy = require('http-proxy-middleware');
var app = express();

// if we are just exposing static resources, we don't need to listen to specific GET requests...
/*
app.get('/', function (req, res) {
  res.send('Hello New World!');
});
*/

app.listen(3000, function () {
  console.log('express_middleware_test : app listening on port 3000!');
});

// middleware function
var myLogger = function (req, res, next) {
  //console.log('MIDDLEWARE LOG! file requested : ' + req.path);
  next();
};

var rootUrl;

// simply proxy the request
var proxyMyRequest = function (req, res, next) {

  var targetUrl;

  // not req.path - need the query parameters!!

  var requestSub = req.path.substring(0,5);
  //console.log("requestSub : " + requestSub);
  if(requestSub === '/http') {
    targetUrl = req.path.substr(1);
    rootUrl = targetUrl;
    //console.log("Setting rootUrl : " + rootUrl);
  } else {
    targetUrl = rootUrl + '/' + req.originalUrl.substr(1);
    //console.log("Dynamic proxy request targetUrl : " + targetUrl);
  }

  console.log("Attempting proxy to : " + targetUrl);

  // white/black list check?
  //if(!entitlementCheckPassed) {
  //  res.status(403).send({ error: 'Entitlement Check Failed - Access Forbidden' });

  /*
  var options = {
    url: targetUrl,
    //headers: {
    //  'content-type': 'application/json'
    //},
    headers: req.headers
  };
  */

  //proxy(targetUrl);

  /*
  // create request
  request(targetUrl, function (error, response, body) {
  //request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);

      res.send(body);
      //res.send('ALL DONE');
    } else {
      console.log("ERROR RESPONSE : " + targetUrl + " : " + error);
      res.send(error);
    }
  })
  */

  // return response
  //res.send('ALL DONE');

  // can't do this, it will trigger a response, which then prevents the above code returning a response in the callback
  // can't set headers after they are sent
  //next();
}

// load middleware function - order/placement is important!
app.use(myLogger);
//app.use(proxyMyRequest);
//app.use('/proxy', proxy('www.google.com'));
app.use('/proxy', proxy({target: 'http://www.google.com', changeOrigin: true}));

//app.use(entitlementChecker);
//app.use(locationChecker);

// expose the public data area, containing our static JSON resources
app.use(express.static('public'));

// error handling comes last/next - i.e. previous middleware hasn't succesfully processed the request and returned to the client
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send({error: 'Server Error, probable 404!' });
});
