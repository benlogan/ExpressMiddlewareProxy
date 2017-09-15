var request = require('request');
var express = require('express');

var app = express();
var port = 8888;

app.listen(port, function () {
  console.log('express_middleware_test : app listening on port : ' + port);
});

// middleware logging/debug function
var myLogger = function (req, res, next) {
  console.log('express_middleware_test : URL requested : ' + req.path);
  next();
};

//var rootUrl;

var simpleProxy = function (req, res, next) {
    req.pipe(request('http://bbc.co.uk')).pipe(res);
}

// simply proxy/pipe the request
var proxyMyRequest = function (req, res, next) {
    var targetUrl = req.path.substr(1);
    console.log("express_middleware_test : proxy to : " + targetUrl);
    
    // if you are proxying dynamically remember that req.path won't contain the query parameters!
        
    var requestSub = targetUrl.substring(0,4);
    //console.log("requestSub : " + requestSub);
    
    if(requestSub === 'http') {
        //rootUrl = targetUrl;
        console.log("express_middleware_test : proxying!");
        
        // PROXY/PIPE
        //req.pipe(request(targetUrl)).pipe(res);
        
        var x = request(targetUrl);
        req.pipe(x);
        x.pipe(res);
    } else {
        console.log("express_middleware_test : ignoring!");
        // do nothing
    }
}

var whitelist = [
    "http://bbc.co.uk", 
    "http://www.nufc.com"];

var whitelistChecker = function (req, res, next) {
    var targetUrl = req.path.substr(1);
    if(!whitelist.includes(targetUrl)) {
        console.log("express_middleware_test : whitelist check failed for : " + targetUrl);
        console.log("express_middleware_test : whitelist : " + whitelist);
        res.status(403).send({ error: 'Whitelist Check Failed - Access Forbidden'});
    }
    else {
        next();
    }
}

/*
var entitlementChecker = function (req, res, next) {
    if(!entitlementCheckPassed) {
    res.status(403).send({ error: 'Entitlement Check Failed - Access Forbidden' });
}
*/

// load middleware function - order/placement is important!
app.use(myLogger);

//app.use(whitelistChecker); // DISABLED - FIXME this needs to handle site resources etc or operate only on the parent/initial request
//app.use(entitlementChecker);
//app.use(locationChecker);

//app.use(simpleProxy);
app.use(proxyMyRequest); // needs to be at the end of the chain, no next()

// error handling comes last/next - i.e. previous middleware hasn't succesfully processed the request and returned to the client
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({error: 'Server Error, probable 404!' });
});