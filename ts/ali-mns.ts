/// <reference path="../dts/external.d.ts" />

// dependencies
var Buffer:any  = require("buffer");
var CryptoA:any  = require("crypto");
var Events:any  = require("events");
var Util:any    = require("util");
var Url:any     = require("url");
var UA:any      = require("universal-analytics");
var debug:any   = require("debug")("ali-mns");

var Promise:any = require("promise");

var Request:any = require("request");
Request.requestP = Promise.denodeify(Request);
Request.debug = false;

var Xml2js:any  = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);

var XmlBuilder:any = require("xmlbuilder");