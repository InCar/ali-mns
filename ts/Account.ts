
module AliMQS{
    // The Ali account, it holds the key id and secret.
    export class Account{
        constructor(ownerId:string, keyId:string, keySecret:string){
            this._ownerId = ownerId;
            this._keyId = keyId;
            this._keySecret = keySecret;
        }

        public getOwnerId(){ return this._ownerId; }
        public getKeyId(){ return this._keyId; }

        // encoding: "hex", "binary" or "base64"
        public hmac_sha1(text:string, encoding?:string){
            var hmacSHA1:any = Crypto.createHmac("sha1", this._keySecret);
            return hmacSHA1.update(text).digest(encoding);
        }

        private _ownerId: string; // Owner id
        private _keyId: string; // Access key id
        private _keySecret: string; // Access key secret
    }
}