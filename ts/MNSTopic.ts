/// <reference path="Interfaces.ts" />

module AliMNS{
    export class MNSTopic extends MNS implements IMNSTopic{
        public constructor(account:Account, region?:string){
            super(account, region);
            // make url
            this._urlTopic = this.makeTopicURL();
        }
        
        // List all topics.
        public listTopicP(prefix?:string, pageSize?:number, pageMarker?:string){
            var headers = {};
            if(prefix)      headers["x-mns-prefix"] = prefix;
            if(pageMarker)  headers["x-mns-marker"] = pageMarker;
            if(pageSize)    headers["x-mns-ret-number"] = pageSize;
            var url = this._urlTopic.slice(0, -1);
            debug("GET " + url);
            return this._openStack.sendP("GET", url, null, headers);
        }
        
        // Create a topic
        public createTopicP(name:string, options?:any){
            var body = { Topic: "" };
            if(options) body.Topic = options;
            var url = Url.resolve(this._urlTopic, name);
            debug("PUT " + url, body);
            return this._openStack.sendP("PUT", url, body);
        }
        
        // Delete a topic
        public deleteTopicP(name:string){
            var url = Url.resolve(this._urlTopic, name);
            debug("DELETE " + url);
            return this._openStack.sendP("DELETE", url);
        }
        
        private makeTopicURL(){
            return Util.format(this._patternTopic, this._account.getAccountId(), this._region);
        }
        
        private _patternTopic = "http://%s.mns.cn-%s.aliyuncs.com/topics/";
        private _urlTopic:String;
    }
}