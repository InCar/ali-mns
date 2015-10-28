module AliMQS{
    // The MQS can list, create, delete, modify the mq.
    export class MQS{
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

        // List all mqs.
        public listP(prefix?:string, pageSize?:number, pageMarker?:string){
            var headers = {};
            if(prefix)      headers["x-mqs-prefix"] = prefix;
            if(pageMarker)  headers["x-mqs-marker"] = pageMarker;
            if(pageSize)    headers["x-mqs-ret-number"] = pageSize;
            return this._openStack.sendP("GET", this._url, null, headers);
        }

        // Create a message queue
        public createP(name:string, options?:any){
            var body = { Queue: "" };
            if(options) body.Queue = options;
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("PUT", url, body);
        }

        // Delete a message queue
        public deleteP(name:string){
            var url = Url.resolve(this._url, name);
            return this._openStack.sendP("DELETE", url);
        }

        private makeURL(){
            return Util.format(this._pattern, this._account.getOwnerId(), this._region);
        }

        private _account:Account; // Ali account
        private _region = "hangzhou"; // region: hangzhou, beijing, qingdao
        private _pattern = "http://%s.mqs-cn-%s.aliyuncs.com";
        private _url:string; // mqs url
        private _openStack: OpenStack;
    }
}