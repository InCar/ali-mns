import Promise from 'promise';

var Request:{ new (input: RequestInfo, init?: RequestInit): Request; prototype: Request; } = require("request");
Request['requestP'] = Promise.denodeify(Request);
Request['debug'] = false;

var Xml2js:any  = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);
