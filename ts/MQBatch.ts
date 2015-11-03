/// <reference path="MQ.ts" />
/// <reference path="Msg.ts" />

module AliMNS{
    export class MQBatch extends MQ{
        constructor(name:string, account:Account, region?:string){
            super(name, account, region);
        }

        public sendP(msg:string | Array<Msg>, priority?:number, delaySeconds?:number){
            if(typeof msg === "string"){
                return super.sendP(msg, priority, delaySeconds);
            }
            else{
                var body : any = { Messages: { '#list': [] } };
                for(var i=0;i<msg.length;i++){
                    var m : Msg = msg[i];
                    var b64 = this.utf8ToBase64(m.getMsg());
                    var xMsg:any = {Message: {MessageBody: b64}};
                    xMsg.Message.Priority = m.getPriority();
                    xMsg.Message.DelaySeconds = m.getDelaySeconds();

                    body.Messages['#list'].push(xMsg);
                }

                debug("POST " + this._url, body);
                return this._openStack.sendP("POST", this._url, body);
            }
        }

        public recvP(waitSeconds?:number, numOfMessages?:number){
            if(numOfMessages && numOfMessages > 1){
                var _this = this;
                var url = this._url;
                url += "?numOfMessages=" + numOfMessages;
                if(waitSeconds) url += "&waitseconds=" + waitSeconds;
                
                debug("GET " + url);
    
                return new Promise(function(resolve, reject){
                    var bGotResponse = false;
                    // wait more 5 seconds to trigger timeout error
                    var timeOutSeconds = 5;
                    if(waitSeconds) timeOutSeconds += waitSeconds;
                    setTimeout(function(){
                        if(!bGotResponse) reject(new Error("timeout"));
                    }, 1000*timeOutSeconds);
    
    
                    _this._openStack.sendP("GET", url).done(function(data){
                        debug(data);
                        bGotResponse = true;
                        _this.decodeB64Messages(data);
                        resolve(data);
                    }, function(ex){
                        debug(ex);
                        bGotResponse = true;
                        reject(ex);
                    });
                })
            }
            else{
                return super.recvP(waitSeconds);
            }
        }

        public peekP(numOfMessages?:number){
            if(numOfMessages && numOfMessages > 1){
                var _this = this;
                var url = this._url + "?peekonly=true";
                url += "&numOfMessages=" + numOfMessages;
                debug("GET " + url);
                return this._openStack.sendP("GET", url).then(function(data){
                    debug(data);
                    _this.decodeB64Messages(data);
                    return data;
                });
            }
            else{
                return super.peekP();
            }
        }

        public deleteP(receiptHandle:string | Array<string>){
            if(typeof receiptHandle === "string") {
                super.deleteP(receiptHandle);
            }
            else{
                return Promise.reject("NotImplementation");
            }
        }
        
        private decodeB64Messages(data:any){
            if(data){
                if(data.Message && data.Message.MessageBody){
                    data.Message.MessageBody = this.base64ToUtf8(data.Message.MessageBody);
                }
                else if(data.Messages && data.Messages.Message){
                    for(var i=0;i<data.Messages.Message.length;i++){
                        var msg = data.Messages.Message[i];
                        if(msg.MessageBody) msg.MessageBody = this.base64ToUtf8(msg.MessageBody);
                    }
                }
            }
        }
    }
}