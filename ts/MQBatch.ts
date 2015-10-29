module AliMNS{
    export class MQBatch extends MQ{
        constructor(name:string, account:Account, region?:string){
            super(name, account, region);
        }

        public sendP(msg:string | Array<Msg>, priority?:number, delaySeconds?:number){
            if(msg instanceof String){
                return super.sendP(msg, priority, delaySeconds);
            }
            else{
                return Promise.reject("NotImplementation");
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
            if(receiptHandle instanceof String) {
                super.deleteP(receiptHandle);
            }
            else{
                return Promise.reject("NotImplementation");
            }
        }
    }
}