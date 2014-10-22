
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
            this._url = this.makeURL();

            // create the OpenStack object
            this._openStack = new OpenStack(account);
        }

        // 发送消息
        public sendP(msg:string, priority?:number, delaySeconds?:number){
            var body :any = { Message: { MessageBody: msg } };
            if(!isNaN(priority)) body.Message.Priority = priority;
            if(!isNaN(delaySeconds)) body.Message.DelaySeconds = delaySeconds;

            return this._openStack.sendP("POST", this._url, body);
        }

        // 接收消息
        public recvP(){
            return this._openStack.sendP("GET", this._url);
        }

        // 删除消息
        public deleteP(receiptHandle:string){
            return this._openStack.sendP("DELETE", this._url + "?ReceiptHandle=" + receiptHandle);
        }

        private makeURL(){
            return Util.format(this._pattern, this._account.getOwnerId(), this._region, this._name);
        }

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
        private _url:string; // mq url
        private _pattern = "http://%s.mqs-cn-%s.aliyuncs.com/%s/messages";
        private _openStack: OpenStack;
    }
}