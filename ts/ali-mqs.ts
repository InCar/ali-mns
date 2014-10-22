/// <reference path="../dts/external.d.ts" />

// Exports the AliMQS
module.exports = AliMQS;

// dependencies
var Util:any    = require("util");
var Url:any     = require("url");
var Crypto:any  = require("crypto");
var Buffer:any  = require("buffer");

var Promise:any = require("promise");

var Request:any = require("request");
Request.requestP = Promise.denodeify(Request);
// Request.debug = true;

var Xml2js:any  = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);