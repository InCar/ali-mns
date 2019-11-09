/// <reference path="MQ.ts" />
/// <reference path="Msg.ts" />
/// <reference path="Interfaces.ts" />

    import {IMQBatch, INotifyRecvBatch} from "./Interfaces";
import {MQ} from "./MQ";
import {Account} from './Account'
import {Msg} from "./Msg";
import {NotifyRecv} from "./NotifyRecv";

export class MQBatch extends MQ implements IMQBatch, INotifyRecvBatch{
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
                this._openStack.accumulateNextGASend("MQBatch.sendP");
                return this._openStack.sendP("POST", this._url, body);
            }
        }

        public recvP(waitSeconds?:number, numOfMessages?:number){
            if(numOfMessages === undefined) numOfMessages = 16;
            if(numOfMessages && numOfMessages > 1){
                var self = this;
                var url = this._url;
                url += "?numOfMessages=" + numOfMessages;
                if(waitSeconds) url += "&waitseconds=" + waitSeconds;

                debug("GET " + url);

                return new Promise(function(resolve, reject){
                    // use the timeout mechanism inside the request module
                    var options = { timeout: 1000 * self._recvTolerance };
                    if(waitSeconds) options.timeout += (1000 * waitSeconds);

                    self._openStack.accumulateNextGASend("MQBatch.recvP");
                    self._openStack.sendP("GET", url, null, null, options).done(function(data){
                        debug(data);
                        self.decodeB64Messages(data);
                        resolve(data);
                    }, function(ex){
                        // for compatible with 1.x, still use literal "timeout"
                        if(ex.code === "ETIMEDOUT"){
                            var exTimeout:any = new Error("timeout");
                            exTimeout.innerException = ex;
                            exTimeout.code = ex.code;
                            reject(exTimeout);
                        }
                        else{
                            reject(ex);
                        }
                    });
                })
            }
            else{
                return super.recvP(waitSeconds);
            }
        }

        public peekP(numOfMessages?:number){
            if(numOfMessages === undefined) numOfMessages = 16;
            if(numOfMessages && numOfMessages > 1){
                var self = this;
                var url = this._url + "?peekonly=true";
                url += "&numOfMessages=" + numOfMessages;
                debug("GET " + url);
                this._openStack.accumulateNextGASend("MQBatch.peekP");
                return this._openStack.sendP("GET", url).then(function(data){
                    debug(data);
                    self.decodeB64Messages(data);
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
                debug("DELETE " + this._url, receiptHandle);
                var body : any = { ReceiptHandles: { '#list': [] } };
                for(var i=0;i<receiptHandle.length;i++){
                    var r:any = { ReceiptHandle: receiptHandle[i] };
                    body.ReceiptHandles['#list'].push(r);
                }
                this._openStack.accumulateNextGASend("MQBatch.deleteP");
                return this._openStack.sendP("DELETE", this._url, body);
            }
        }

        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        public notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number, numOfMessages?:number){
            // lazy create
            if(this._notifyRecv === null) this._notifyRecv = new NotifyRecv(this);

            return this._notifyRecv.notifyRecv(cb, waitSeconds || 5, numOfMessages || 16);
        }

        protected decodeB64Messages(data:any){
            if(data && data.Messages && data.Messages.Message){
                if(!Util.isArray(data.Messages.Message)){
                    // Just a single message, use an array to hold it
                    var msg = data.Messages.Message;
                    data.Messages.Message = [msg];
                }
                for(var i=0;i<data.Messages.Message.length;i++){
                    var msg = data.Messages.Message[i];
                    if(msg.MessageBody) msg.MessageBody = this.base64ToUtf8(msg.MessageBody);
                }
            }
            else{
                super.decodeB64Messages(data);
            }
        }

        protected _notifyRecv: INotifyRecvBatch = null;
    }
