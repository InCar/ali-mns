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
            this._url = this.makeURL();

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
        
        /*protected utf8ToBase64(src){
            var buf = new Buffer.Buffer(src, 'utf8');
            return buf.toString('base64');
        }
        
        protected base64ToUtf8(src){
            var buf = new Buffer.Buffer(src, 'base64');
            return buf.toString('utf8');
        }
        
        protected decodeB64Messages(data:any){
            if(data && data.Message && data.Message.MessageBody){
                data.Message.MessageBody = this.base64ToUtf8(data.Message.MessageBody);
            }
        }*/

        private makeAttrURL(){
            return Util.format(this._pattern, this._account.getAccountId(), this._region, this._name);
        }

        private makeURL(){
            return this.makeAttrURL() + "/messages";
        }

        protected _url:string; // topic url
        protected _openStack: OpenStack;

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
        private _urlAttr: string; // topic attr url
        private _pattern = "http://%s.mns.cn-%s.aliyuncs.com/topics/%s";
    }
}