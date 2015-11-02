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
                return Promise.reject("NotImplementation");
            }
            else{
                return super.recvP(waitSeconds);
            }
        }

        public peekP(numOfMessages?:number){
            if(numOfMessages && numOfMessages > 1){
                return Promise.reject("NotImplementation");
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
    }
}