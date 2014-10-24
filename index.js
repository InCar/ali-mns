var AliMQS;
(function (AliMQS) {
    // The Ali account, it holds the key id and secret.
    var Account = (function () {
        function Account(ownerId, keyId, keySecret) {
            this._ownerId = ownerId;
            this._keyId = keyId;
            this._keySecret = keySecret;
        }
        Account.prototype.getOwnerId = function () {
            return this._ownerId;
        };
        Account.prototype.getKeyId = function () {
            return this._keyId;
        };

        // encoding: "hex", "binary" or "base64"
        Account.prototype.hmac_sha1 = function (text, encoding) {
            var hmacSHA1 = Crypto.createHmac("sha1", this._keySecret);
            return hmacSHA1.update(text).digest(encoding);
        };

        Account.prototype.b64md5 = function (text) {
            var cryptoMD5 = Crypto.createHash("md5");
            var md5HEX = cryptoMD5.update(text).digest("hex");
            var buf = new Buffer.Buffer(md5HEX, "utf8");
            return buf.toString("base64");
        };
        return Account;
    })();
    AliMQS.Account = Account;
})(AliMQS || (AliMQS = {}));
var AliMQS;
(function (AliMQS) {
    // The MQ
    var MQ = (function () {
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        function MQ(name, account, region) {
            this._region = "hangzhou";
            this._pattern = "http://%s.mqs-cn-%s.aliyuncs.com/%s/messages";
            this._signalSTOP = true;
            this._evStopped = "AliMQS_MQ_NOTIFY_STOPPED";
            this._name = name;
            this._account = account;
            if (region)
                this._region = region;

            // make url
            this._url = this.makeURL();

            // create the OpenStack object
            this._openStack = new AliMQS.OpenStack(account);

            // emitter
            this._emitter = new Events.EventEmitter();
        }
        // 发送消息
        MQ.prototype.sendP = function (msg, priority, delaySeconds) {
            var body = { Message: { MessageBody: msg } };
            if (!isNaN(priority))
                body.Message.Priority = priority;
            if (!isNaN(delaySeconds))
                body.Message.DelaySeconds = delaySeconds;

            return this._openStack.sendP("POST", this._url, body);
        };

        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        MQ.prototype.recvP = function (waitSeconds) {
            var url = this._url;
            if (waitSeconds)
                url += "?waitseconds=" + waitSeconds;
            return this._openStack.sendP("GET", url);
        };

        // 删除消息
        MQ.prototype.deleteP = function (receiptHandle) {
            return this._openStack.sendP("DELETE", this._url + "?ReceiptHandle=" + receiptHandle);
        };

        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        MQ.prototype.notifyRecv = function (cb) {
            this._signalSTOP = false;
            this.notifyRecvInternal(cb);
        };

        MQ.prototype.notifyRecvInternal = function (cb) {
            var _this = this;
            var waitSeconds = 5;

            // This signal will be triggered by notifyStopP()
            if (this._signalSTOP) {
                this._emitter.emit(this._evStopped);
                return;
            }

            this.recvP(waitSeconds).done(function (dataRecv) {
                try  {
                    if (cb(null, dataRecv)) {
                        _this.deleteP(dataRecv.Message.ReceiptHandle).done(null, function (ex) {
                            console.log(ex);
                        });
                    }
                } catch (ex) {
                    // ignore any ex throw from cb
                }
                _this.notifyRecvInternal(cb);
            }, function (ex) {
                if (ex.Error.Code !== "MessageNotExist") {
                    try  {
                        cb(ex, null);
                    } catch (ex) {
                        // ignore any ex throw from cb
                    }
                }

                console.log(ex);
                process.nextTick(function () {
                    _this.notifyRecvInternal(cb);
                });
            });
        };

        // 停止消息通知
        MQ.prototype.notifyStopP = function () {
            var _this = this;
            if (this._signalSTOP)
                return Promise.resolve(this._evStopped);

            this._signalSTOP = true;
            return new Promise(function (resolve) {
                _this._emitter.once(_this._evStopped, function () {
                    resolve(_this._evStopped);
                });
            });
        };

        MQ.prototype.makeURL = function () {
            return Util.format(this._pattern, this._account.getOwnerId(), this._region, this._name);
        };
        return MQ;
    })();
    AliMQS.MQ = MQ;
})(AliMQS || (AliMQS = {}));
var AliMQS;
(function (AliMQS) {
    // The MQS can list, create, delete, modify the mq.
    var MQS = (function () {
        // The constructor. account: ali account; region: can be "hangzhou", "beijing" or "qingdao", default is "hangzhou"
        function MQS(account, region) {
            this._region = "hangzhou";
            this._pattern = "http://%s.mqs-cn-%s.aliyuncs.com";
            // save the input arguments
            this._account = account;
            if (region)
                this._region = region;

            // make url
            this._url = this.makeURL();

            // create the OpenStack object
            this._openStack = new AliMQS.OpenStack(account);
        }
        // List all mqs.
        MQS.prototype.listP = function (prefix, pageMarker, pageSize) {
            var headers = {};
            if (prefix)
                headers["x-mqs-prefix"] = prefix;
            if (pageMarker)
                headers["x-mqs-marker"] = pageMarker;
            if (pageSize)
                headers["x-mqs-ret-number"] = pageSize;
            return this._openStack.sendP("GET", this._url, null, headers);
        };

        // Create a message queue
        MQS.prototype.createP = function (name, options) {
            var body = { Queue: "" };
            if (options)
                body.Queue = options;
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("PUT", url, body).then(function () {
                return url;
            });
        };

        MQS.prototype.deleteP = function (name) {
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("DELETE", url).then(function () {
                return 0;
            });
        };

        MQS.prototype.makeURL = function () {
            return Util.format(this._pattern, this._account.getOwnerId(), this._region);
        };
        return MQS;
    })();
    AliMQS.MQS = MQS;
})(AliMQS || (AliMQS = {}));
// The Ali open interface stack
var AliMQS;
(function (AliMQS) {
    // the ali open interface stack protocol
    var OpenStack = (function () {
        function OpenStack(account) {
            this._patternMQS = "MQS %s:%s";
            this._patternSign = "%s\n%s\n%s\n%s\n%s%s";
            this._contentType = "text/xml;charset=utf-8";
            this._version = "2014-07-08";
            this._account = account;

            // xml builder
            this._xmlBuilder = new Xml2js.Builder();
        }
        // Send the request
        // method: GET, POST, PUT, DELETE
        // url: request url
        // body: optional, request body
        // head: optional, request heads
        OpenStack.prototype.sendP = function (method, url, body, headers) {
            var req = { method: method, url: url };
            if (body)
                req.body = this._xmlBuilder.buildObject(body);

            req.headers = this.makeHeaders(method, url, headers, req.body);

            return Request.requestP(req).then(function (response) {
                // convert the body from xml to json
                return Xml2js.parseStringP(response.body, { explicitArray: false }).then(function (bodyJSON) {
                    response.bodyJSON = bodyJSON;
                    return response;
                }, function () {
                    // cannot parse as xml
                    response.bodyJSON = response.body;
                    return response;
                });
            }).then(function (response) {
                if (response.statusCode < 400)
                    return response.bodyJSON;
                else
                    return Promise.reject(response.bodyJSON);
            });
        };

        OpenStack.prototype.makeHeaders = function (mothod, url, headers, body) {
            // if not exist, create one
            if (!headers)
                headers = {};

            var contentMD5 = "";
            var contentType = "";
            if (body) {
                if (!headers["Content-Length"])
                    headers["Content-Length"] = body.length;
                if (!headers["Content-Type"])
                    headers["Content-Type"] = this._contentType;
                contentType = headers["Content-Type"];
                contentMD5 = this._account.b64md5(body);
                headers["Content-MD5"] = contentMD5;
            }

            if (!headers["x-mqs-version"])
                headers["x-mqs-version"] = this._version;

            // lowercase & sort & extract the x-mqs-<any>
            var headsLower = {};
            var keys = [];
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    var lower = key.toLowerCase();
                    keys.push(lower);
                    headsLower[lower] = headers[key];
                }
            }

            keys.sort();

            var mqsHeaders = "";
            for (var i in keys) {
                var k = keys[i];
                if (k.indexOf("x-mqs-") === 0) {
                    mqsHeaders += Util.format("%s:%s\n", k, headsLower[k]);
                }
            }

            var tm = (new Date()).toUTCString();
            var mqsURL = Url.parse(url);
            headers.Date = tm;
            headers.Authorization = this.authorize(mothod, mqsURL.path, mqsHeaders, contentType, contentMD5, tm);
            headers.Host = mqsURL.host;

            return headers;
        };

        // ali mqs authorize header
        OpenStack.prototype.authorize = function (httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm) {
            return Util.format(this._patternMQS, this._account.getKeyId(), this.signature(httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm));
        };

        // ali mqs signature
        OpenStack.prototype.signature = function (httpVerb, mqsURI, mqsHeaders, contentType, contentMD5, tm) {
            var text = Util.format(this._patternSign, httpVerb, contentMD5, contentType, tm, mqsHeaders, mqsURI);

            return this._account.hmac_sha1(text, "base64");
        };
        return OpenStack;
    })();
    AliMQS.OpenStack = OpenStack;
})(AliMQS || (AliMQS = {}));
/// <reference path="../dts/external.d.ts" />
// Exports the AliMQS
module.exports = AliMQS;

// dependencies
var Buffer = require("buffer");
var Crypto = require("crypto");
var Events = require("events");
var Util = require("util");
var Url = require("url");

var Promise = require("promise");

var Request = require("request");
Request.requestP = Promise.denodeify(Request);

// Request.debug = true;
var Xml2js = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);
//# sourceMappingURL=index.js.map
