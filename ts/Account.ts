/// <reference path="ali-mns.ts" />

module AliMNS{
    // The Ali account, it holds the key id and secret.
    export class Account{
        constructor(accountId:string, keyId:string, keySecret:string){
            this._accountId = accountId;
            this._keyId = keyId;
            this._keySecret = keySecret;
        }

        public getAccountId(){ return this._accountId; }
        public getOwnerId(){ return this._accountId; } // for compatible v1.x
        public getKeyId(){ return this._keyId; }
        public getGA(){ return this._bGoogleAnalytics; }
        public setGA(bGA:boolean){ this._bGoogleAnalytics = bGA; }
        public getHttps(){ return this._bHttps; }
        public setHttps(bHttps:boolean){ this._bHttps = bHttps; }

        // encoding: "hex", "binary" or "base64"
        public hmac_sha1(text:string, encoding?:string){
            var hmacSHA1:any = CryptoA.createHmac("sha1", this._keySecret);
            return hmacSHA1.update(text).digest(encoding);
        }

        public b64md5(text:string){
            var cryptoMD5 = CryptoA.createHash("md5");
            return cryptoMD5.update(new Buffer(text, 'utf-8')).digest("base64");
        }

        private _accountId: string; // Owner id
        private _keyId: string; // Access key id
        private _keySecret: string; // Access key secret
        private _bGoogleAnalytics = true; // Enable Google Analytics
        private _bHttps = false; // Default to use http
    }
}