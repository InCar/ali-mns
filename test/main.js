// test

var Path = require("path");
var fs = require("fs");
var Promise = require("promise");
var AliMQS = require(Path.join(__dirname, "../index.js"));

function runTest(){
    // ali account configuration
    var aliCfg = {
        ownerId: "your-owner-id",
        keyId: "your-key-id",
        keySecret: "your-key-secret",
        region: "hangzhou",
        mqName: "dev"
    };

    // test/account.js contains sensitive data, and will not be pushed to github
    var cfgPath = Path.join(__dirname, "account.js");
    if(fs.existsSync(cfgPath)){
        aliCfg = require(cfgPath);
    }
    var account = new AliMQS.Account(aliCfg.ownerId, aliCfg.keyId, aliCfg.keySecret);
    var mqs = new AliMQS.MQS(account, aliCfg.region);
    var mq = new AliMQS.MQ(aliCfg.mqName, account, aliCfg.region);

    var testAll = [];
    testAll.push(mqs.listP());
    testAll.push(mq.sendP("test").then(function(dataSend){
        console.log(dataSend);
        console.log("\t-----");
        return mq.recvP();
    }).then(function(dataRecv){
        console.log(dataRecv);
        console.log("\t-----");
        return mq.deleteP(dataRecv.Message.ReceiptHandle)
            .then(function(){
                return "Deleted succeed: " + dataRecv.Message.ReceiptHandle;
            });
    }));

    var i = 0;
    testAll.forEach(function(any){
        any.done(function(ret){
            i++;
            console.log("Test " + i + " succeed!");
            console.log(ret);
            console.log("-----");
        }, function(ex){
            i++;
            console.log("Test " + i + " failed!");
            console.log(ex);
            console.log("-----");
        });
    });

    return Promise.all(testAll).then(function(){
        return "Test finished!";
    });
}

runTest().done(function(data){
    console.log(data);
}, function (ex) {
    console.log(ex);
});