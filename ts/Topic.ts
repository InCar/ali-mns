/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="Region.ts" />

    // The Topic
    import {OpenStack} from "./OpenStack";
import {City, NetworkType, Region, Zone} from "./Region";
import {ITopic} from "./Interfaces";
import {Account} from "./Account"

export class Topic implements ITopic{
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        constructor(name:string, account:Account, region?:string|Region){
            this._name = name;
            this._account = account;
            // region
            if(region){
                if(typeof region === "string") this._region = new Region(region, NetworkType.Public, Zone.China);
                else this._region = region;
            }

            // make url
            this._urlAttr = this.makeAttrURL();
            this._urlSubscription = this.makeSubscriptionURL();
            this._urlPublish = this.makePublishURL();

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

        public subscribeP(name:string, endPoint:string, notifyStrategy?:string, notifyContentFormat?:string, filterTag?:string){
            var body = {
                Subscription: {
                    Endpoint: endPoint
                }
            };
            if(notifyStrategy) body.Subscription['NotifyStrategy'] = notifyStrategy;
            if(notifyContentFormat) body.Subscription['NotifyContentFormat'] = notifyContentFormat;
            if(filterTag) body.Subscription['FilterTag'] = filterTag;
            var url = Url.resolve(this._urlSubscription, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        }

        public unsubscribeP(name:string){
            var url = Url.resolve(this._urlSubscription, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        }

        public publishP(msg:string, b64:boolean, tag?:string, attrs?: any, options?:any){
            var msgBlock:any = {
                MessageBody: b64?this.utf8ToBase64(msg):msg
            };

            if(tag) msgBlock.MessageTag = tag;
            if(attrs) msgBlock.MessageAttributes = attrs;

            var body = {
                Message: msgBlock
            };

            debug("POST " + this._urlPublish, body);

            this._openStack.accumulateNextGASend("Topic.publishP");
            return this._openStack.sendP("POST", this._urlPublish, body, null, options);
        }

        protected utf8ToBase64(src){
            var buf = new Buffer(src, 'utf8');
            return buf.toString('base64');
        }

        private makeAttrURL(){
            return Util.format(this._pattern,
                this._account.getHttps()?"https":"http",
                this._account.getAccountId(),
                this._region.toString(),
                this._name);
        }

        private makeSubscriptionURL(){
            return this.makeAttrURL() + "/subscriptions/";
        }

        private makePublishURL(){
            return this.makeAttrURL() + "/messages";
        }

        private _urlSubscription:string; // topic subscription url
        private _urlPublish:string; // publish message url
        protected _openStack: OpenStack;

        private _name: string;
        private _region = new Region(City.Hangzhou);
        private _account: Account;
        private _urlAttr: string; // topic attr url
        private _pattern = "%s://%s.mns.%s.aliyuncs.com/topics/%s";
    }
