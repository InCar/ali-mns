
module AliMQS{
    // The MQ
    export class MQ{
        // The constructor. name & account is required.
        // region can be "hangzhou", "beijing" or "qingdao", the default is "hangzhou"
        constructor(name:string, account:Account, region?:string){
            this._name = name;
            this._account = account;
            if(region) this._region = region;
        }

        private _name: string;
        private _region = "hangzhou";
        private _account: Account;
    }
}