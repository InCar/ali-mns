// The Ali open interface stack

module AliMQS{
    // the ali open interface stack protocol
    export class OpenStack{
        constructor(account:Account){
            this._account = account;
        }

        // Send the request
        // method: GET, POST, PUT, DELETE
        // url: request url
        // body: optional, request body
        // head: optional, request heads
        public sendP(mothod:string, url:string, body?:any, headers?:any){
            return Request.requestP({
                mothod:mothod,
                url:url,
                headers: this.makeHeaders(mothod, url, headers)
            }).then((response)=>{
                // convert the body from xml to json
                return Xml2js.parseStringP(response.body, {explicitArray: false})
                    .then((bodyJSON)=>{
                        response.bodyJSON = bodyJSON;
                        return response;
                    });
            }).then((response)=>{
                if(response.statusCode < 400) return response.bodyJSON; // 200 okay!
                else return Promise.reject(response.bodyJSON);
            });
        }

        private makeHeaders(mothod:string, url:string, headers?:any){
            // if not exist, create one
            if(!headers) headers = {};

            if(!headers["x-mqs-version"]) headers["x-mqs-version"] = "2014-07-08";

            // lowercase & sort & extract the x-mqs-<any>
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

            var headsCanonicalize : any = {};
            var mqsHeaders = "";
            for(var key in keys){
                headsCanonicalize[key] = headsLower[key];

                if(key.indexOf("x-mqs-") === 0){
                    mqsHeaders += Util.format("%s:%s\n", key, headsLower[key]);
                }
            }

            var tm = (new Date()).toUTCString();
            var mqsURL:any = Url.parse(url);
            headsCanonicalize.Authorization = this.authorize(mothod, mqsURL.path, mqsHeaders, tm);
            headsCanonicalize.Date = tm;
            headsCanonicalize.Host = mqsURL.host;

            return headsCanonicalize;
        }

        // ali mqs authorize header
        private authorize(httpVerb:string, mqsURI:string, mqsHeaders:any, tm:string){
            return Util.format(this._patternMQS, this._account.getKeyId(),
                this.signature(httpVerb, mqsURI, mqsHeaders, tm));
        }

        // ali mqs signature
        private signature(httpVerb:string, mqsURI:string, mqsHeaders:string, tm:string){
            var contentMD5 = "";
            var contentType = "";

            var text = Util.format(this._patternSign,
                httpVerb, contentMD5, contentType, tm,
                mqsHeaders, mqsURI);

            return this._account.hmac_sha1(text, "base64");
        }

        private _account:Account;
        private _patternMQS = "MQS %s:%s";
        private _patternSign = "%s\n%s\n%s\n%s\n%s%s";
    }
}