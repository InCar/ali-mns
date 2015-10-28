var AliMNS;
(function (AliMNS) {
    // The Ali account, it holds the key id and secret.
    var Account = (function () {
        function Account(accountId, keyId, keySecret) {
            this._accountId = accountId;
            this._keyId = keyId;
            this._keySecret = keySecret;
        }
        Account.prototype.getAccountId = function () {
            return this._accountId;
        };
        Account.prototype.getKeyId = function () {
            return this._keyId;
        };
        // encoding: "hex", "binary" or "base64"
        Account.prototype.hmac_sha1 = function (text, encoding) {
            var hmacSHA1 = CryptoA.createHmac("sha1", this._keySecret);
            return hmacSHA1.update(text).digest(encoding);
        };
        Account.prototype.b64md5 = function (text) {
            var cryptoMD5 = CryptoA.createHash("md5");
            var md5HEX = cryptoMD5.update(text).digest("hex");
            var buf = new Buffer.Buffer(md5HEX, "utf8");
            return buf.toString("base64");
        };
        return Account;
    })();
    AliMNS.Account = Account;
})(AliMNS || (AliMNS = {}));
var AliMNS;
(function (AliMNS) {
    // The MNS can list, create, delete, modify the mq.
    var MNS = (function () {
        // The constructor. account: ali account; region: can be "hangzhou", "beijing" or "qingdao", default is "hangzhou"
        function MNS(account, region) {
            this._region = "hangzhou"; // region: hangzhou, beijing, qingdao
            this._pattern = "http://%s.mns.cn-%s.aliyuncs.com";
            // save the input arguments
            this._account = account;
            if (region)
                this._region = region;
            // make url
            this._url = this.makeURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(account);
        }
        // List all mns.
        MNS.prototype.listP = function (prefix, pageSize, pageMarker) {
            var headers = {};
            if (prefix)
                headers["x-mns-prefix"] = prefix;
            if (pageMarker)
                headers["x-mns-marker"] = pageMarker;
            if (pageSize)
                headers["x-mns-ret-number"] = pageSize;
            return this._openStack.sendP("GET", this._url, null, headers);
        };
        // Create a message queue
        MNS.prototype.createP = function (name, options) {
            var body = { Queue: "" };
            if (options)
                body.Queue = options;
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("PUT", url, body);
        };
        // Delete a message queue
        MNS.prototype.deleteP = function (name) {
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("DELETE", url);
        };
        MNS.prototype.makeURL = function () {
            return Util.format(this._pattern, this._account.getAccountId(), this._region);
        };
        return MNS;
    })();
    AliMNS.MNS = MNS;
})(AliMNS || (AliMNS = {}));
var AliMNS;
(function (AliMNS) {
    // The MQ
    var MQ = (function () {
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        function MQ(name, account, region) {
            this._region = "hangzhou";
            this._pattern = "http://%s.mns-cn-%s.aliyuncs.com/%s";
            this._signalSTOP = true;
            this._evStopped = "AliMNS_MQ_NOTIFY_STOPPED";
            // 连续timeout计数器
            // 在某种未知的原因下,网络底层链接断了
            // 这时在程序内部的重试无法促使网络重连,以后的重试都是徒劳的
            // 如果连续发生反复重试都依然timeout,那么极有可能已经发生此种情况了
            // 这时抛出NetworkBroken异常
            this._timeoutCount = 0;
            this._timeoutMax = 128;
            this._name = name;
            this._account = account;
            if (region)
                this._region = region;
            // make url
            this._urlAttr = this.makeAttrURL();
            this._url = this.makeURL();
            // create the OpenStack object
            this._openStack = new AliMNS.OpenStack(account);
            // emitter
            this._emitter = new Events.EventEmitter();
        }
        // 获取MQ的属性值
        MQ.prototype.getAttrsP = function () {
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        };
        // 设置MQ的属性值
        MQ.prototype.setAttrsP = function (options) {
            var body = { Queue: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        };
        // 发送消息
        MQ.prototype.sendP = function (msg, priority, delaySeconds) {
            var b64 = this.utf8ToBase64(msg);
            var body = { Message: { MessageBody: b64 } };
            if (!isNaN(priority))
                body.Message.Priority = priority;
            if (!isNaN(delaySeconds))
                body.Message.DelaySeconds = delaySeconds;
            debug("PUT " + this._url, body);
            return this._openStack.sendP("POST", this._url, body);
        };
        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        MQ.prototype.recvP = function (waitSeconds) {
            var _this = this;
            var url = this._url;
            if (waitSeconds)
                url += "?waitseconds=" + waitSeconds;
            debug("GET " + url);
            return new Promise(function (resolve, reject) {
                var bGotResponse = false;
                // wait more 5 seconds to trigger timeout error
                var timeOutSeconds = 5;
                if (waitSeconds)
                    timeOutSeconds += waitSeconds;
                setTimeout(function () {
                    if (!bGotResponse)
                        reject(new Error("timeout"));
                }, 1000 * timeOutSeconds);
                _this._openStack.sendP("GET", url).done(function (data) {
                    debug(data);
                    bGotResponse = true;
                    if (data && data.Message && data.Message.MessageBody) {
                        data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody);
                    }
                    resolve(data);
                }, function (ex) {
                    debug(ex);
                    bGotResponse = true;
                    reject(ex);
                });
            });
        };
        // 检查消息
        MQ.prototype.peekP = function () {
            var _this = this;
            debug("GET " + this._url);
            return this._openStack.sendP("GET", this._url + "?peekonly=true").then(function (data) {
                debug(data);
                if (data && data.Message && data.Message.MessageBody) {
                    data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody);
                }
                return data;
            });
        };
        // 删除消息
        MQ.prototype.deleteP = function (receiptHandle) {
            debug("DELETE " + this._url);
            return this._openStack.sendP("DELETE", this._url + "?ReceiptHandle=" + receiptHandle);
        };
        // 保留消息
        MQ.prototype.reserveP = function (receiptHandle, reserveSeconds) {
            debug("PUT " + this._url);
            return this._openStack.sendP("PUT", this._url + "?ReceiptHandle=" + receiptHandle + "&VisibilityTimeout=" + reserveSeconds);
        };
        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        MQ.prototype.notifyRecv = function (cb, waitSeconds) {
            this._signalSTOP = false;
            this._timeoutCount = 0;
            this.notifyRecvInternal(cb, waitSeconds || 5);
        };
        MQ.prototype.notifyRecvInternal = function (cb, waitSeconds) {
            var _this = this;
            // This signal will be triggered by notifyStopP()
            if (this._signalSTOP) {
                debug("notifyStopped");
                this._emitter.emit(this._evStopped);
                return;
            }
            debug("notifyRecvInternal()");
            try {
                this.recvP(waitSeconds).done(function (dataRecv) {
                    try {
                        debug(dataRecv);
                        _this._timeoutCount = 0;
                        if (cb(null, dataRecv)) {
                            _this.deleteP(dataRecv.Message.ReceiptHandle).done(null, function (ex) {
                                console.log(ex);
                            });
                        }
                    }
                    catch (ex) {
                    }
                    _this.notifyRecvInternal(cb, waitSeconds);
                }, function (ex) {
                    debug(ex);
                    if ((!ex.Error) || (ex.Error.Code !== "MessageNotExist")) {
                        cb(ex, null);
                    }
                    if (ex) {
                        if (ex.message === "timeout") {
                            _this._timeoutCount++;
                            if (_this._timeoutCount > _this._timeoutMax) {
                                // 极度可能网络底层断了
                                cb(new Error("NetworkBroken"), null);
                            }
                        }
                        else if (ex.Error && ex.Error.Code === "MessageNotExist") {
                            _this._timeoutCount = 0;
                        }
                    }
                    process.nextTick(function () {
                        _this.notifyRecvInternal(cb, waitSeconds);
                    });
                });
            }
            catch (ex) {
                // ignore any ex 
                console.log(ex.toString());
                // 过5秒重试
                debug("Retry after 5 seconds");
                setTimeout(function () {
                    _this.notifyRecvInternal(cb, waitSeconds);
                }, 5000);
            }
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
        MQ.prototype.makeAttrURL = function () {
            return Util.format(this._pattern, this._account.getAccountId(), this._region, this._name);
        };
        MQ.prototype.makeURL = function () {
            return this.makeAttrURL() + "/messages";
        };
        MQ.prototype.utf8ToBase64 = function (src) {
            var buf = new Buffer.Buffer(src, 'utf8');
            return buf.toString('base64');
        };
        MQ.prototype.base64ToUtf8 = function (src) {
            var buf = new Buffer.Buffer(src, 'base64');
            return buf.toString('utf8');
        };
        return MQ;
    })();
    AliMNS.MQ = MQ;
})(AliMNS || (AliMNS = {}));
// The Ali open interface stack
var AliMNS;
(function (AliMNS) {
    // the ali open interface stack protocol
    var OpenStack = (function () {
        function OpenStack(account) {
            this._patternMNS = "MNS %s:%s";
            this._patternSign = "%s\n%s\n%s\n%s\n%s%s";
            this._contentType = "text/xml;charset=utf-8";
            this._version = "2015-06-06";
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
                if (response.statusCode < 400) {
                    if (response.bodyJSON)
                        return response.bodyJSON;
                    else
                        return response.statusCode;
                }
                else {
                    if (response.bodyJSON)
                        return Promise.reject(response.bodyJSON);
                    else
                        return Promise.reject(response.statusCode);
                }
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
            // if(!headers["Date"]) headers["Date"] = (new Date()).toUTCString();
            // if(!headers["Host"]) headers["Host"] = Url.parse(url).Host;
            if (!headers["x-mns-version"])
                headers["x-mns-version"] = this._version;
            // lowercase & sort & extract the x-mns-<any>
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
            var mnsHeaders = "";
            for (var i in keys) {
                var k = keys[i];
                if (k.indexOf("x-mns-") === 0) {
                    mnsHeaders += Util.format("%s:%s\n", k, headsLower[k]);
                }
            }
            var tm = (new Date()).toUTCString();
            var mnsURL = Url.parse(url);
            headers.Date = tm;
            headers.Authorization = this.authorize(mothod, mnsURL.path, mnsHeaders, contentType, contentMD5, tm);
            headers.Host = mnsURL.host;
            return headers;
        };
        // ali mns authorize header
        OpenStack.prototype.authorize = function (httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm) {
            return Util.format(this._patternMNS, this._account.getKeyId(), this.signature(httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm));
        };
        // ali mns signature
        OpenStack.prototype.signature = function (httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm) {
            var text = Util.format(this._patternSign, httpVerb, contentMD5, contentType, tm, mnsHeaders, mnsURI);
            return this._account.hmac_sha1(text, "base64");
        };
        return OpenStack;
    })();
    AliMNS.OpenStack = OpenStack;
})(AliMNS || (AliMNS = {}));
/// <reference path="../dts/external.d.ts" />
// Exports the AliMNS
module.exports = AliMNS;
// dependencies
var Buffer = require("buffer");
var CryptoA = require("crypto");
var Events = require("events");
var Util = require("util");
var Url = require("url");
var debug = require("debug")("ali-mns");
var Promise = require("promise");
var Request = require("request");
Request.requestP = Promise.denodeify(Request);
// Request.debug = true;
var Xml2js = require("xml2js");
Xml2js.parseStringP = Promise.denodeify(Xml2js.parseString);
//# sourceMappingURL=index.js.map