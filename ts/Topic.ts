/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />

module AliMNS{
    // The Topic
    export class Topic implements ITopic{
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        constructor(name:string, account:Account, region?:string){
            this._name = name;
            this._account = account;
            if(region) this._region = region;

            // make url
            this._urlAttr = this.makeAttrURL();
            this._urlSubscription = this.makeSubscriptionURL();

            // create the OpenStack object
            this._openStack = new OpenStack(account);
        }
        
        public getName(){ return this._name; }
        public getAccount(){ return this._account; }
        public getRegion(){ return this._region; }

        // 获取Topic的属性值
        public getAttrsP(){
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        }

        // 设置Topic的属性值
        public setAttrsP(options:any){
            var body = { Topic: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        }
        
        // List all subscriptions.
        public listP(prefix?:string, pageSize?:number, pageMarker?:string){
            var headers = {};
            if(prefix)      headers["x-mns-prefix"] = prefix;
            if(pageMarker)  headers["x-mns-marker"] = pageMarker;
            if(pageSize)    headers["x-mns-ret-number"] = pageSize;
            var url = this._urlSubscription.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        }
        
        public subscribeP(name:string, endPoint:string, notifyStrategy?:string, notifyContentFormat?:string){
            var body = {
                Subscription: {
                    Endpoint: endPoint
                }
            };
            if(notifyStrategy) body.Subscription['NotifyStrategy'] = notifyStrategy;
            if(notifyContentFormat) body.Subscription['NotifyContentFormat'] = notifyContentFormat;
            var url = Url.resolve(this._urlSubscription, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        }
        
        public unsubscribeP(name:string){
            var url = Url.resolve(this._urlSubscription, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        }

        private makeAttrURL(){
            return Util.format(this._pattern, this._account.getAccountId(), this._region, this._name);
        }

        private makeSubscriptionURL(){
            return this.makeAttrURL() + "/subscriptions/";
        }

        private _urlSubscription:string; // topic subscription url
        protected _openStack: OpenStack;

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
        private _urlAttr: string; // topic attr url
        private _pattern = "http://%s.mns.cn-%s.aliyuncs.com/topics/%s";
    }
}