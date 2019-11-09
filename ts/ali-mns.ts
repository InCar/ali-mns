import CryptoA from 'crypto'
import Events from 'events';
import Util from 'util';
import Url from 'url'
import UA from 'universal-analytics'
import Promise from 'promise';

import debug0 from "debug"
const debug = debug0('ali-mns');

var Request:{ new (input: RequestInfo, init?: RequestInit): Request; prototype: Request; } = require("request");
Request['requestP'] = Promise.denodeify(Request);
Request['debug'] = false;

var Xml2js:any  = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);

var XmlBuilder:any = require("xmlbuilder");
