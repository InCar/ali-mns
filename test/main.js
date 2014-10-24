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

    return mqs.createP(aliCfg.mqName, {
        DelaySeconds: 0,
        MaximumMessageSize: 65536,
        MessageRetentionPeriod: 345600,
        VisibilityTimeout: 30,
        PollingWaitSeconds: 0
    }).then(function(){
        var testAll = [];
        // test: list all of the mqs queue.
        testAll.push(mqs.listP("de").then(function(data){
            console.log(data.Queues.Queue);
            return data;
        }));

        // test: set and get attributes;
        testAll.push(mq.setAttrsP({ VisibilityTimeout: 36 }).then(function(data){
            console.log(data);
            return mq.getAttrsP();
        }));

        // test: send, peek, receive then reserve delete
        testAll.push(mq.sendP("test").then(function(dataSend){
            console.log(dataSend);
            console.log("\t-----");
            return mq.peekP();
        }).then(function(dataPeek){
            console.log(dataPeek);
            console.log("\t-----");
            return mq.recvP(10);
        }).then(function(dataRecv){
            console.log(dataRecv);
            console.log("\t-----");
            return mq.reserveP(dataRecv.Message.ReceiptHandle, 43200);
        }).then(function(dataReserved){
            console.log(dataReserved);
            console.log("\t-----");
            return mq.deleteP(dataReserved.ChangeVisibility.ReceiptHandle);
        }));

        // test: send 3 messages and receive then all by notifyRecv
        var notifyCount = 0, notifyConfirmed = 0;
        testAll.push(Promise.all([mq.sendP("testA"), mq.sendP("testB"), mq.sendP("testC")]).then(function(){
            return new Promise(function(resolve, reject){
                mq.notifyRecv(function(ex, dataRecv){
                    notifyCount++;
                    if(ex) {
                        console.log(ex);
                    }
                    else {
                        notifyConfirmed++;
                        console.log(dataRecv);
                    }
                    console.log("\t-----");

                    if(notifyCount >= 3){
                        mq.notifyStopP().done(function(){
                            if(notifyConfirmed >= 3) resolve("notifyRecv task succeed!");
                            else reject("notifyRecv task failed!");
                        });
                    }

                    return true;
                });
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
    }).then(function(data){
        // test: delete mq
        mqs.deleteP(aliCfg.mqName);
        return data;
    }, function(ex){
        mqs.deleteP(aliCfg.mqName);
        return Promise.reject(ex);
    });
}

runTest().done(function(data){
    console.log(data);
}, function (ex) {
    console.log(ex);
});