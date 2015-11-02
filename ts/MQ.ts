/// <reference path="Account.ts" />
/// <reference path="OpenStack.ts" />

module AliMNS{
    // The MQ
    export class MQ{
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

            // emitter
            this._emitter = new Events.EventEmitter();
        }

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
            return this._openStack.sendP("POST", this._url, body);
        }

        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        public recvP(waitSeconds?:number){
            var _this = this;
            var url = this._url;
            if(waitSeconds) url += "?waitseconds=" + waitSeconds;
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
                    if(data && data.Message && data.Message.MessageBody){
                        data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody)
                    }
                    resolve(data);
                }, function(ex){
                    debug(ex);
                    bGotResponse = true;
                    reject(ex);
                });
            });
        }

        // 检查消息
        public peekP(){
            var _this = this;
            debug("GET " + this._url);
            return this._openStack.sendP("GET", this._url + "?peekonly=true").then(function(data){
                debug(data);
                if(data && data.Message && data.Message.MessageBody){
                    data.Message.MessageBody = _this.base64ToUtf8(data.Message.MessageBody)
                }
                return data;
            });
        }

        // 删除消息
        public deleteP(receiptHandle:string){
            debug("DELETE " + this._url);
            return this._openStack.sendP("DELETE", this._url + "?ReceiptHandle=" + receiptHandle);
        }

        // 保留消息
        public reserveP(receiptHandle:string, reserveSeconds:number){
            debug("PUT " + this._url);
            return this._openStack.sendP("PUT", this._url
                + "?ReceiptHandle=" + receiptHandle
                + "&VisibilityTimeout=" + reserveSeconds);
        }

        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        public notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number){
            this._signalSTOP = false;
            this._timeoutCount = 0;
            this.notifyRecvInternal(cb, waitSeconds || 5);
        }

        private notifyRecvInternal(cb:(ex:Error, msg:any)=>Boolean, waitSeconds:number){
            // This signal will be triggered by notifyStopP()
            if(this._signalSTOP){
                debug("notifyStopped");
                this._emitter.emit(this._evStopped);
                return;
            }

            debug("notifyRecvInternal()");

            try {
                this.recvP(waitSeconds).done((dataRecv)=> {
                    try {
                        debug(dataRecv);
                        this._timeoutCount = 0;
                        if (cb(null, dataRecv)) {
                            this.deleteP(dataRecv.Message.ReceiptHandle)
                                .done(null, (ex)=> {
                                    console.log(ex);
                                });
                        }
                    }
                    catch (ex) {
                        // ignore any ex throw from cb
                    }
                    this.notifyRecvInternal(cb, waitSeconds);
                }, (ex)=> {
                    debug(ex);
                    if ((!ex.Error) || (ex.Error.Code !== "MessageNotExist")) {
                        cb(ex, null);
                    }

                    if(ex) {
                        if (ex.message === "timeout") {
                            this._timeoutCount++;
                            if (this._timeoutCount > this._timeoutMax) {
                                // 极度可能网络底层断了
                                cb(new Error("NetworkBroken"), null);
                            }
                        }
                        else if (ex.Error && ex.Error.Code === "MessageNotExist") {
                            this._timeoutCount = 0;
                        }
                    }

                    process.nextTick(()=> {
                        this.notifyRecvInternal(cb, waitSeconds);
                    });
                });
            }
            catch(ex){
                // ignore any ex 
                console.log(ex.toString());
                // 过5秒重试
                debug("Retry after 5 seconds");
                setTimeout(()=>{
                    this.notifyRecvInternal(cb, waitSeconds);
                }, 5000);
            }
        }

        // 停止消息通知
        public notifyStopP(){
            if(this._signalSTOP)
                return Promise.resolve(this._evStopped);

            this._signalSTOP = true;
            return new Promise((resolve)=>{
                this._emitter.once(this._evStopped, ()=>{
                    resolve(this._evStopped);
                });
            });
        }

        private makeAttrURL(){
            return Util.format(this._pattern, this._account.getAccountId(), this._region, this._name);
        }

        private makeURL(){
            return this.makeAttrURL() + "/messages";
        }
        
        protected utf8ToBase64(src){
            var buf = new Buffer.Buffer(src, 'utf8');
            return buf.toString('base64');
        }
        
        private base64ToUtf8(src){
            var buf = new Buffer.Buffer(src, 'base64');
            return buf.toString('utf8');
        }

        protected _url:string; // mq url
        protected _openStack: OpenStack;

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
        private _urlAttr: string; // mq attr url
        private _pattern = "http://%s.mns.cn-%s.aliyuncs.com/queues/%s";
        private _signalSTOP = true;
        private _evStopped = "AliMNS_MQ_NOTIFY_STOPPED";
        private _emitter:any;

        // 连续timeout计数器
        // 在某种未知的原因下,网络底层链接断了
        // 这时在程序内部的重试无法促使网络重连,以后的重试都是徒劳的
        // 如果连续发生反复重试都依然timeout,那么极有可能已经发生此种情况了
        // 这时抛出NetworkBroken异常
        private _timeoutCount = 0;
        private _timeoutMax = 128;
    }
}