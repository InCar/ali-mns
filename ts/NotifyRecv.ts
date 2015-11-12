/// <reference path="Interfaces.ts" />

module AliMNS{
    export class NotifyRecv implements INotifyRecv {
        public constructor(mq:MQ){
            this._mq = mq;

            // emitter
            this._emitter = new Events.EventEmitter();
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
                this._mq.recvP(waitSeconds).done((dataRecv)=> {
                    try {
                        debug(dataRecv);
                        this._timeoutCount = 0;
                        if (cb(null, dataRecv)) {
                            this._mq.deleteP(dataRecv.Message.ReceiptHandle)
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
        
        private _mq: MQ;
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