// The Ali open interface stack
/// <reference path="ali-mns.ts" />
/// <reference path="Account.ts" />

module AliMNS{
    // the ali open interface stack protocol
    export class OpenStack{
        constructor(account:Account){
            this._account = account;
            // xml builder
            this._xmlBuilder = XmlBuilder;
            // Google Analytics
            this._ga = new GA(account.getAccountId());
            this._ga.disableGA(!account.getGA());
        }

        // Send the request
        // method: GET, POST, PUT, DELETE
        // url: request url
        // body: optional, request body
        // head: optional, request heads
        // options: optional, request options
        public sendP(method:string, url:string, body?:any, headers?:any, options?:any){
            var req :any = { method:method, url:url };
            if(body) req.body = this._xmlBuilder.create(body).toString();

            req.headers = this.makeHeaders(method, url, headers, req.body);
            
            // combines options
            if(options){
                for(var opt in options){
                    if(opt === "method" || opt === "url" || opt === "uri" || opt === "body" || opt === "headers")
                        continue; // skip these options for avoid conflict to other arguments
                    else if(options.hasOwnProperty(opt))
                        req[opt] = options[opt];
                }
            }

            var ret = Request['requestP'](req).then((response)=>{
                // convert the body from xml to json
                return Xml2js.parseStringP(response.body, {explicitArray: false})
                    .then((bodyJSON)=> {
                        response.bodyJSON = bodyJSON;
                        return response;
                    }, ()=>{
                        // cannot parse as xml
                        response.bodyJSON = response.body;
                        return response;
                    });
            }).then((response)=>{
                if(response.statusCode < 400) { // 200 okay!
                    if(response.bodyJSON) return response.bodyJSON;
                    else return response.statusCode;
                }
                else {
                    if(response.bodyJSON) return Promise.reject(response.bodyJSON);
                    else return Promise.reject(response.statusCode);
                }
            });
            
            // google analytics
            if(this._gaRGA % 1000000 == 0)
                this._ga.send("OpenStack.sendP", this._gaRGA, url);
            this._gaRGA++;
            
            return ret;
        }
        
        public accumulateNextGASend(prefix:string){
            this._ga.accumulateNextSend(prefix);
        }
        
        public disableGA(bDisable?:boolean){
            this._ga.disableGA(bDisable);
        }

        private makeHeaders(mothod:string, url:string, headers:any, body?:string){
            // if not exist, create one
            if(!headers) headers = {
                "User-Agent": "Node/" + process.version + " (" + process.platform + ")"
            };

            var contentMD5 = "";
            var contentType = "";
            if(body){
                if(!headers["Content-Length"]) headers["Content-Length"] = (new Buffer(body, 'utf-8')).length;
                if(!headers["Content-Type"]) headers["Content-Type"] = this._contentType;
                contentType = headers["Content-Type"];
                contentMD5 = this._account.b64md5(body);
                headers["Content-MD5"] = contentMD5;
            }

            // `Date` & `Host` will be added by request automatically
            if(!headers["x-mns-version"]) headers["x-mns-version"] = this._version;

            // lowercase & sort & extract the x-mns-<any>
            var headsLower :any = {};
            var keys : Array<string> = [];
            for(var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    var lower = key.toLowerCase();
                    keys.push(lower);
                    headsLower[lower] = headers[key];
                }
            }

            keys.sort();

            var mnsHeaders = "";
            for(var i in keys){
                var k = keys[i];
                if(typeof k === "string" && k.indexOf("x-mns-") === 0){
                    mnsHeaders += Util.format("%s:%s\n", k, headsLower[k]);
                }
            }

            var tm = (new Date()).toUTCString();
            var mnsURL:any = Url.parse(url);
            headers.Date = tm;
            headers.Authorization = this.authorize(mothod, mnsURL.path,
                mnsHeaders, contentType, contentMD5, tm);
            headers.Host = mnsURL.host;

            return headers;
        }

        // ali mns authorize header
        private authorize(httpVerb:string, mnsURI:string, mnsHeaders:any, contentType:string, contentMD5:string, tm:string){
            return Util.format(this._patternMNS, this._account.getKeyId(),
                this.signature(httpVerb, mnsURI, mnsHeaders, contentType, contentMD5, tm));
        }

        // ali mns signature
        private signature(httpVerb:string, mnsURI:string, mnsHeaders:string, contentType:string, contentMD5:string, tm:string){
            var text = Util.format(this._patternSign,
                httpVerb, contentMD5, contentType, tm,
                mnsHeaders, mnsURI);

            return this._account.hmac_sha1(text, "base64");
        }

        private _account:Account;
        private _patternMNS = "MNS %s:%s";
        private _patternSign = "%s\n%s\n%s\n%s\n%s%s";
        private _xmlBuilder: any;
        private _contentType = "text/xml;charset=utf-8";
        private _version = "2015-06-06";
        private _ga: GA;
        private _gaRGA = 0; // Reduce Google Analysis sending rate
    }
}