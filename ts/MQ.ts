/// <reference path="Interfaces.ts" />
/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />
/// <reference path="NotifyRecv.ts" />
/// <reference path="Region.ts" />

    // The MQ
    import {OpenStack} from "./OpenStack";
import {IMQ, INotifyRecv} from "./Interfaces";
import {City, NetworkType, Region, Zone} from "./Region";
import {Account} from './Account';
import {NotifyRecv} from "./NotifyRecv";

export class MQ implements IMQ, INotifyRecv{
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
            this._url = this.makeURL();

            // create the OpenStack object
            this._openStack = new OpenStack(account);
        }

        public getName(){ return this._name; }
        public getAccount(){ return this._account; }
        public getRegion(){ return this._region; }

        // 获取MQ的属性值
        public getAttrsP(){
            debug("GET " + this._urlAttr);
            return this._openStack.sendP("GET", this._urlAttr);
        }

        // 设置MQ的属性值
        public setAttrsP(options:any){
            var body = { Queue: options };
            debug("PUT " + this._urlAttr, body);
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        }

        // 发送消息
        public sendP(msg:string, priority?:number, delaySeconds?:number){

            var b64 = this.utf8ToBase64(msg);

            var body :any = { Message: { MessageBody: b64 } };
            if(!isNaN(priority)) body.Message.Priority = priority;
            if(!isNaN(delaySeconds)) body.Message.DelaySeconds = delaySeconds;

            debug("POST " + this._url, body);
            this._openStack.accumulateNextGASend("MQ.sendP");
            return this._openStack.sendP("POST", this._url, body);
        }

        // 接收消息容忍时间(秒)
        public getRecvTolerance(){ return this._recvTolerance; }
        public setRecvTolerance(value:number){ this._recvTolerance = value; }

        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        public recvP(waitSeconds?:number){
            var _this = this;
            var url = this._url;
            if(waitSeconds) url += "?waitseconds=" + waitSeconds;
            debug("GET " + url);

            return new Promise(function(resolve, reject){
                // use the timeout mechanism inside the request module
                var options = { timeout: 1000 * _this._recvTolerance };
                if(waitSeconds) options.timeout += (1000 * waitSeconds);

                _this._openStack.accumulateNextGASend("MQ.recvP");
                _this._openStack.sendP("GET", url, null, null, options).done(function(data){
                    debug(data);
                    if(data && data.Message && data.Message.MessageBody){
                        data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody)
                    }
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
            });
        }

        // 检查消息
        public peekP(){
            var _this = this;
            var url = this._url + "?peekonly=true";
            debug("GET " + url);
            this._openStack.accumulateNextGASend("MQ.peekP");
            return this._openStack.sendP("GET", url).then(function(data){
                debug(data);
                _this.decodeB64Messages(data);
                return data;
            });
        }

        // 删除消息
        public deleteP(receiptHandle:string){
            var url = this._url +  "?ReceiptHandle=" + receiptHandle;
            debug("DELETE " + url);
            this._openStack.accumulateNextGASend("MQ.deleteP");
            return this._openStack.sendP("DELETE", url);
        }

        // 保留消息
        public reserveP(receiptHandle:string, reserveSeconds:number){
            var url = this._url
                + "?ReceiptHandle=" + receiptHandle
                + "&VisibilityTimeout=" + reserveSeconds;
            debug("PUT " + url);
            this._openStack.accumulateNextGASend("MQ.reserveP");
            return this._openStack.sendP("PUT", url);
        }

        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        public notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number){
            // lazy create
            if(this._notifyRecv === null) this._notifyRecv = new NotifyRecv(this);

            return this._notifyRecv.notifyRecv(cb, waitSeconds || 5);
        }

        // 停止消息通知
        public notifyStopP(){
            if(this._notifyRecv === null) return Promise.resolve(0);
            else return this._notifyRecv.notifyStopP();
        }

        protected utf8ToBase64(src){
            var buf = new Buffer(src, 'utf8');
            return buf.toString('base64');
        }

        protected base64ToUtf8(src){
            var buf = new Buffer(src, 'base64');
            return buf.toString('utf8');
        }

        protected decodeB64Messages(data:any){
            if(data && data.Message && data.Message.MessageBody){
                data.Message.MessageBody = this.base64ToUtf8(data.Message.MessageBody);
            }
        }

        private makeAttrURL(){
            return Util.format(this._pattern,
                this._account.getHttps()?"https":"http",
                this._account.getAccountId(),
                this._region.toString(),
                this._name);
        }

        private makeURL(){
            return this.makeAttrURL() + "/messages";
        }

        protected _url:string; // mq url
        protected _openStack: OpenStack;
        protected _notifyRecv: INotifyRecv = null;
        protected _recvTolerance = 5; // 接收消息的容忍时间(单位:秒)

        private _name: string;
        private _region = new Region(City.Hangzhou);
        private _account: Account;
        private _urlAttr: string; // mq attr url
        private _pattern = "%s://%s.mns.%s.aliyuncs.com/queues/%s";
    }
