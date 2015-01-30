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
    
    var testCase = [];
    
    // test#0 create mq
    testCase.push(function(){
        return mqs.createP(aliCfg.mqName, {
            DelaySeconds: 0,
            MaximumMessageSize: 65536,
            MessageRetentionPeriod: 345600,
            VisibilityTimeout: 30,
            PollingWaitSeconds: 0
        });
    });

    // test#1 list all of the mqs queue.
    testCase.push(function(){
        return mqs.listP("MQ", 1).then(function(data){
            console.log(data.Queues.Queue);
            return data;
        });
    });

    // test#2 set and get attributes;
    testCase.push(function(){
        return mq.setAttrsP({ VisibilityTimeout: 36 }).then(function(data){
            console.log(data);
            return mq.getAttrsP();
        });
    });

    // test#3 send, peek, receive then reserve delete
    testCase.push(function(){
        return mq.sendP("test").then(function(dataSend){
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
        });
    });

    // test#4 send 3 messages and receive then all by notifyRecv
    testCase.push(function(){
        var notifyCount = 0, notifyConfirmed = 0;
        return Promise.all([mq.sendP("testA"), mq.sendP("testB"), mq.sendP("testC")]).then(function(){
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
                }, 5);
            });
        });
    });
    
    // test#5 中文测试
    testCase.push(function(){
        return mq.sendP("中文测试").then(function(){
            return mq.recvP(5);
        });
    });

    // test#6 delete mq
    testCase.push(function(){
        return mqs.deleteP(aliCfg.mqName);
    });
    
    var testAction = [0, 1, 2, 3, 4, 5, 6];
    // var testAction = [0, 4, 6];
    function testOneByOne(i){
        if(i < testAction.length){
            var testFn = testCase[testAction[i]];
            return testFn().then(function(){
                console.log("Test case " + testAction[i] + " succeed.");
                return testOneByOne(i+1);
            }, function(ex){
                console.log("Test case " + testAction[i] + " failed.");
                console.log(ex);
                return testOneByOne(i+1);
            });
        }
        else{
            return Promise.resolve("Test finished.");
        }
    }
    
    return testOneByOne(0);
}

runTest().done(function(data){
    console.log(data);
}, function (ex) {
    console.log(ex);
});