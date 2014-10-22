// test

var Path = require("path");
var fs = require("fs");
var AliMQS = require(Path.join(__dirname, "../index.js"));

function runTest(){
    // ali account configuration
    var aliCfg = {
        ownerId: "your-owner-id",
        keyId: "your-key-id",
        keySecret: "your-key-secret",
        region: "hangzhou"
    };

    // test/account.js contains sensitive data, and will not be pushed to github
    var cfgPath = Path.join(__dirname, "account.js");
    if(fs.existsSync(cfgPath)){
        aliCfg = require(cfgPath);
    }
    var account = new AliMQS.Account(aliCfg.ownerId, aliCfg.keyId, aliCfg.keySecret);
    var mqs = new AliMQS.MQS(account, aliCfg.region);

    return mqs.listP();
}

runTest().done(function(ret){
    console.log("okay");
    console.log(ret);
}, function(ex){
    console.log("failed");
    console.log(ex);
});