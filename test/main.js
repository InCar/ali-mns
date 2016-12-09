// mocha test

var assert = require("assert");
var Path = require("path");
var fs = require("fs");
var Promise = require("promise");
var AliMNS = require(Path.join(__dirname, "../index.js"));

describe('AliMNS-main', function(){
    // ali account configuration
    var aliCfg = {
        accountId: "your-account-id",
        keyId: "your-key-id",
        keySecret: "your-key-secret",
        region: new AliMNS.Region(AliMNS.City.Hangzhou),
        mqName: "dev"
    };

    // test/account.js contains sensitive data, and will not be tracked by git
    var cfgPath = Path.join(__dirname, "account.js");
    if(fs.existsSync(cfgPath)){
        aliCfg = require(cfgPath);
    }
    var account = new AliMNS.Account(aliCfg.accountId, aliCfg.keyId, aliCfg.keySecret);
    var mns = new AliMNS.MNS(account, aliCfg.region);
    
    describe('Compatible', function(){
        it('#MQS', function(){
            var AliMQS = AliMNS;
            var mqs = new AliMQS.MQS(account, aliCfg.region);
            assert.ok(mqs !== null);
        });
        
        it('#Account.getOwnerId', function(){
            var id = account.getOwnerId();
            assert.ok(id !== null);
        });
    });
    
    describe('MNS', function(){
        this.timeout(1000 * 5);
        
        var mqName = aliCfg.mqName + Math.floor(Math.random() * 10000);
        var mq = new AliMNS.MQ(mqName, account, aliCfg.region);
        
        it('#createP', function(done){
            mns.createP(mqName, {
                DelaySeconds: 0,
                MaximumMessageSize: 65536,
                MessageRetentionPeriod: 345600,
                VisibilityTimeout: 30,
                PollingWaitSeconds: 0
            }).then(function(data){ done(); }, done);
        });
        
        it('#listP', function(done){
            mns.listP(mqName, 1).then(function(data){
                // console.info(data.Queues.Queue);
                done(); }, done);
        });
        
        it('#setAttrsP & #getAttrsP', function(done){
            var testSource = 36;
            
            mq.setAttrsP({ VisibilityTimeout: testSource })
            .then(function(dataSet){
                // console.info(dataSet);
                return mq.getAttrsP();
            })
            .then(function(dataGet){
                // console.info(dataGet);
                assert.equal(dataGet.Queue.VisibilityTimeout, testSource);
            })
            .then(function(){ done(); }, done);
        });
        
        it('#sendP & #peekP &recvP & #reserveP & #deleteP', function(done){
            var testSource = "test message"
            mq.setRecvTolerance(5.0);
            
            mq.sendP(testSource)
            .then(function(dataSent){
                // console.info(dataSent);
                return mq.peekP(); })
            .then(function(dataPeek){
                // console.info(dataPeek);
                return mq.recvP(10); })
            .then(function(dataRecv){
                // console.info(dataRecv);
                return mq.reserveP(dataRecv.Message.ReceiptHandle, 43200); })
            .then(function(dataReserved){
                // console.info(dataReserved);
                return mq.deleteP(dataReserved.ChangeVisibility.ReceiptHandle); })
            .then(function(){ done(); }, done);
        });
        
        it('#中文字符集', function(done){
            var testSource = "中文测试";
            var testTarget;
            mq.sendP(testSource).then(function(){
                return mq.recvP(5).then(function(data){
                    testTarget = data.Message.MessageBody;
                });
            })
            .then(function(){
                assert.equal(testTarget, testSource);
            })
            .then(function(){done();}, done);
        });
        
        it('#recvP() force timeout', function(done){
            mq.setRecvTolerance(-4.8); // negative value to force timeout
            mq.recvP(5.0)
            .then(function(data){
                assert.fail(data, "expect timeout");
            }, function(ex){
                assert.equal(ex.code, "ESOCKETTIMEDOUT");
            })
            .then(done, done);
        });
        
        it('#deleteP', function(done){
            mns.deleteP(mqName)
            .then(function(){ done(); }, done);
        });
    });
    
    describe('MNS-notifyRecv', function(){
        this.timeout(1000 * 5);
        
        var mqName = aliCfg.mqName + Math.floor(Math.random() * 10000);
        var mq = new AliMNS.MQ(mqName, account, aliCfg.region);
        
        before(function(done){
            mns.createP(mqName, {
                DelaySeconds: 0,
                MaximumMessageSize: 65536,
                MessageRetentionPeriod: 345600,
                VisibilityTimeout: 30,
                PollingWaitSeconds: 0
            }).then(function(data){ done(); }, done);
        });
        
        it('#notifyRecv', function(done){
            var notifyCount = 0, notifyConfirmed = 0;
            Promise.all([mq.sendP("testA"), mq.sendP("testB"), mq.sendP("testC")])
            .then(function(){
                return new Promise(function(resolve, reject){
                    mq.notifyRecv(function(ex, dataRecv){
                        notifyCount++;
                        if(ex) {
                            // console.info(ex);
                        }
                        else {
                            notifyConfirmed++;
                            // console.log(dataRecv);
                        }
    
                        if(notifyCount >= 3){
                            mq.notifyStopP().done(function(){
                                if(notifyConfirmed >= 3) resolve("notifyRecv task succeed!");
                                else reject("notifyRecv task failed!");
                            });
                        }
                        
                        return true;
                    }, 5);
                });
            })
            .then(function(){ done(); }, done);
        });
        
        after(function(done){
            mns.deleteP(mqName)
            .then(function(){ done(); }, done);
        });
    });
    
    describe('MNS-batchSend', function(){
        this.timeout(1000 * 5);
        
        var mqName = aliCfg.mqName + Math.floor(Math.random() * 10000);
        var mqBatch = new AliMNS.MQBatch(mqName, account, aliCfg.region);
        
        before(function(done){
            mns.createP(mqName, {
                DelaySeconds: 0,
                MaximumMessageSize: 65536,
                MessageRetentionPeriod: 345600,
                VisibilityTimeout: 30,
                PollingWaitSeconds: 0
            }).then(function(data){ done(); }, done);
        });
        
        it('#batchSend', function(done){
            var msgs = [];
            for(var i=0;i<5;i++){
                var msg = new AliMNS.Msg("BatchSend" + i);
                msgs.push(msg);
            }
    
            mqBatch.sendP(msgs)
            .then(function(dataSend){
                // console.info(dataSend);
                return mqBatch.peekP(2);
            })
            .then(function(){ done(); }, done);
        });
        
        var readyToDel = [];
        it('#batchRecv', function(done){
            mqBatch.recvP(5, 3)
            .then(function(dataRecv){
                for(var i=0;i<dataRecv.Messages.Message.length;i++){
                    // console.info(dataRecv.Messages.Message[i].MessageBody);
                    readyToDel.push(dataRecv.Messages.Message[i].ReceiptHandle);
                    assert.ok(dataRecv.Messages.Message[i].MessageBody.indexOf("BatchSend") === 0);
                }
            })
            .then(function(){ done(); }, done);
        });
        
        it('#batchPeek', function(done){
            mqBatch.peekP(2)
            .then(function(dataPeek){
                for(var i=0;i<dataPeek.Messages.Message.length;i++){
                    // console.info(dataPeek.Messages.Message[i].MessageBody);
                    assert.ok(dataPeek.Messages.Message[i].MessageBody.indexOf("BatchSend") === 0);
                }
            })
            .then(function(){ done(); }, done);
        });
        
        it('#batchDelete', function(done){
            mqBatch.deleteP(readyToDel)
            .then(function(){ done(); }, done);
        });
        
        after(function(done){
            mns.deleteP(mqName)
            .then(function(){ done(); }, done);
        });
    });
});