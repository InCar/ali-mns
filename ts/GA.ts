import UA from 'universal-analytics'
import CryptoA from 'crypto'

declare var gitVersion: any;

export class GA {
    public constructor(accId: string) {
        this._gitMark = gitVersion.branch + "." + gitVersion.rev + "@" + gitVersion.hash;
        this._visitor = UA("UA-75293894-6", this.u2id(accId));
    }

    public send(action: string, value: number, url: string) {
        if (this._bGoogleAnalytics) {
            if (this._bAccumulated) {
                // 累积多个一起发送
                this._bAccumulated = false;
                var actionPrefixed = this._bAccumulatePrefix + ":" + action;
                if (!this._accumulation[actionPrefixed]) this._accumulation[actionPrefixed] = {value: 0, count: 0};
                this._accumulation[actionPrefixed].value += value;
                this._accumulation[actionPrefixed].count++;

                if (this._accumulation[actionPrefixed].count >= this._accumutionMax) {
                    this.send(actionPrefixed, this._accumulation[actionPrefixed].value, url);
                    this._accumulation[actionPrefixed].value = 0;
                    this._accumulation[actionPrefixed].count = 0;
                }
            } else {
                var args = {dl: url.replace(this._rgxAccId, "//0.")};
                // catagory, action, label, value, params
                this._visitor.event("AliMNS", action, this._gitMark, value, args).send();
            }
        }
    }

    public accumulateNextSend(prefix: string) {
        this._bAccumulated = true;
        this._bAccumulatePrefix = prefix;
    }

    public disableGA(bDisable?: boolean) {
        this._bGoogleAnalytics = (!bDisable);
    }

    private u2id(uid: string) {
        var cryptoMD5 = CryptoA.createHash("md5");
        var md5HEX = cryptoMD5.update(uid).digest("hex");

        var uxid = new Array(36);
        for (var i = 0, j = 0; i < md5HEX.length; i++, j++) {
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uxid[j] = "-";
                j++;
            }
            uxid[j] = md5HEX.charAt(i);
        }

        return uxid.join("");
    }

    private _visitor: any;
    private _gitMark: string;
    private _bGoogleAnalytics = true;
    private _rgxAccId = /\/\/\w+\./;
    private _bAccumulated = false;
    private _bAccumulatePrefix = "";
    private _accumutionMax = 100;
    private _accumulation: any = {};
}
