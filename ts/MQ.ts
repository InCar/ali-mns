
module AliMQS{
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
            return this._openStack.sendP("GET", this._urlAttr);
        }

        // 设置MQ的属性值
        public setAttrsP(options:any){
            var body = { Queue: options };
            return this._openStack.sendP("PUT", this._urlAttr + "?metaoverride=true", body);
        }

        // 发送消息
        public sendP(msg:string, priority?:number, delaySeconds?:number){
            var body :any = { Message: { MessageBody: msg } };
            if(!isNaN(priority)) body.Message.Priority = priority;
            if(!isNaN(delaySeconds)) body.Message.DelaySeconds = delaySeconds;

            return this._openStack.sendP("POST", this._url, body);
        }

        // 接收消息
        // waitSeconds, 最久等待多少秒0~30
        public recvP(waitSeconds?:number){
            var url = this._url;
            if(waitSeconds) url += "?waitseconds=" + waitSeconds;
            return this._openStack.sendP("GET", url);
        }

        // 检查消息
        public peekP(){
            return this._openStack.sendP("GET", this._url + "?peekonly=true");
        }

        // 删除消息
        public deleteP(receiptHandle:string){
            return this._openStack.sendP("DELETE", this._url + "?ReceiptHandle=" + receiptHandle);
        }

        // 消息通知.每当有消息收到时,都调用cb回调函数
        // 如果cb返回true,那么将删除消息,否则保留消息
        public notifyRecv(cb:(ex:Error, msg:any)=>Boolean){
            this._signalSTOP = false;
            this.notifyRecvInternal(cb);
        }

        private notifyRecvInternal(cb:(ex:Error, msg:any)=>Boolean){
            var waitSeconds = 5;

            // This signal will be triggered by notifyStopP()
            if(this._signalSTOP){
                this._emitter.emit(this._evStopped);
                return;
            }

            this.recvP(waitSeconds).done((dataRecv)=>{
                try {
                    if(cb(null, dataRecv)){
                        this.deleteP(dataRecv.Message.ReceiptHandle)
                            .done(null, (ex)=>{ console.log(ex); });
                    }
                }
                catch(ex){
                    // ignore any ex throw from cb
                }
                this.notifyRecvInternal(cb);
            }, (ex)=>{
                if(ex.Error.Code !== "MessageNotExist") {
                    try {
                        cb(ex, null);
                    }
                    catch (ex) {
                        // ignore any ex throw from cb
                    }
                }

                console.log(ex);
                process.nextTick(()=>{
                    this.notifyRecvInternal(cb);
                });
            });
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
            return Util.format(this._pattern, this._account.getOwnerId(), this._region, this._name);
        }

        private makeURL(){
            return this.makeAttrURL() + "/messages";
        }

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
        private _url:string; // mq url
        private _urlAttr: string; // mq attr url
        private _pattern = "http://%s.mqs-cn-%s.aliyuncs.com/%s";
        private _openStack: OpenStack;
        private _signalSTOP = true;
        private _evStopped = "AliMQS_MQ_NOTIFY_STOPPED";
        private _emitter:any;
    }
}