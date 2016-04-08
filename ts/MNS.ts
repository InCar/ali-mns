/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />

module AliMNS{
    // The MNS can list, create, delete, modify the mq.
    export class MNS implements IMNS {
        // The constructor. account: ali account; region: can be "hangzhou", "beijing" or "qingdao", default is "hangzhou"
        constructor(account:Account, region?:string){
            // save the input arguments
            this._account = account;
            if(region) this._region = region;

            // make url
            this._url = this.makeURL();

            // create the OpenStack object
            this._openStack = new OpenStack(account);
        }

        // List all mns.
        public listP(prefix?:string, pageSize?:number, pageMarker?:string){
            var headers = {};
            if(prefix)      headers["x-mns-prefix"] = prefix;
            if(pageMarker)  headers["x-mns-marker"] = pageMarker;
            if(pageSize)    headers["x-mns-ret-number"] = pageSize;
            var url = this._url.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        }

        // Create a message queue
        public createP(name:string, options?:any){
            var body = { Queue: "" };
            if(options) body.Queue = options;
            var url = Url.resolve(this._url, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        }

        // Delete a message queue
        public deleteP(name:string){
            var url = Url.resolve(this._url, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        }

        private makeURL(){
            return Util.format(this._pattern, this._account.getAccountId(), this._region);
        }

        protected _account:Account; // Ali account
        protected _region = "hangzhou"; // region: hangzhou, beijing, qingdao
        private _pattern = "http://%s.mns.cn-%s.aliyuncs.com/queues/";
        private _url:string; // mns url
        protected _openStack: OpenStack;
    }

    // For compatible v1.x
    export var MQS = MNS;
}