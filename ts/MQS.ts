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
        public listP(){
            return this._openStack.sendP("GET", this._url);
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