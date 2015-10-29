module AliMNS {

    // The Message class
    export class Msg{
        public constructor(msg: string, priority?:number, delaySeconds?:number){

            this._msg = msg;
            if(!isNaN(priority)) this._priority = priority;
            if(!isNaN(delaySeconds)) this._delaySeconds = delaySeconds;
        }

        // message content
        private _msg: string;
        // message priority
        private _priority = 8;
        // message delay to visible, in seconds
        private _delaySeconds = 0;
    }
}
