// mocha test

var assert = require("assert");
var Path = require("path");
var fs = require("fs");
var Promise = require("promise");
var AliMNS = require(Path.join(__dirname, "../index.js"));
var debugTest   = require("debug")("ali-mns.test");

describe.only('AliMNS-performance', function(){
    this.timeout(1000 * 30);
    // ali account configuration
    var aliCfg = {
        accountId: "your-account-id",
        keyId: "your-key-id",
        keySecret: "your-key-secret",
        region: "hangzhou",
        mqName: "dev"
    };

    // test/account.js contains sensitive data, and will not be tracked by git
    var cfgPath = Path.join(__dirname, "account.js");
    if(fs.existsSync(cfgPath)){
        aliCfg = require(cfgPath);
    }
    var account = new AliMNS.Account(aliCfg.accountId, aliCfg.keyId, aliCfg.keySecret);
    var mns = new AliMNS.MNS(account, aliCfg.region);
    var mqs = new Array();
    
    var max_queue = 20;
    var max_msg = 2000;
    
    before(function(done){
        // Make queues
        var mqNameBase = aliCfg.mqName + Math.floor(Math.random() * 10000);
        
        var task = new Array();
        for(var i=1;i<max_queue+1;i++){
            (function(){
                var mqName = mqNameBase + (i<10?"-0":"-") + i;
                var mq = new AliMNS.MQBatch(mqName, account, aliCfg.region);
                var taskCreation = mns.createP(mq.getName()).then(function(){
                    mq.setRecvTolerance(5);
                    // counters
                    mq.ccSent = 0;
                    mq.ccRecv = 0;
                });
                task.push(taskCreation);
                mqs.push(mq);
            })();
        }
        Promise.all(task).then(function(task){ done(); }, done);
    });
    
    after(function(done){
        var task = new Array();
        for(var i=0;i<mqs.length;i++){
            var taskDeletion = mns.deleteP(mqs[i].getName());
            task.push(taskDeletion);
        }
        Promise.all(task).then(function(task){
            // counters
            var totalSend = 0, totalRecv = 0;
            for(var i=0;i<mqs.length;i++){
                var mq = mqs[i];
                totalSend += mq.ccSent;
                totalRecv += mq.ccRecv;
                debugTest(mq.getName() + " sent:" + mq.ccSent + " recv:" +mq.ccRecv);
            }
            debugTest("total " + mqs.length + " queues sent:" + totalSend + " recv:" + totalRecv);
            done();
        }, done);
    });
    
    describe('concurrent-queues', function(){
        
        it('#BatchSend', function(done){
            
            var pickMQ = function(mqs){
                var idx = Math.floor(Math.random() * mqs.length);
                if(idx === mqs.length) idx--;
                return mqs[idx];
            };
            
            var task = [];
            var iSent = 0, batch_size = 16;
            while(iSent < max_msg){
                (function(){
                    var msgs = [];
                    for(var i=0;i<batch_size&&i<max_msg-iSent;i++){
                        msgs.push(new AliMNS.Msg("concurrent-queues-msg" + (iSent + i)));
                    }
                    var mq = pickMQ(mqs);
                    task.push(mq.sendP(msgs));
                    iSent += msgs.length;
                    
                    mq.ccSent += msgs.length;
                    debugTest(tmNow(), mq.getName() + " - " + iSent + " were sent.");
                })();
            }
            Promise.all(task).then(function(){ done(); });
        });
        
        it('#recvP', function(done){
            var recved = 0;
            
            for(var i=0;i<mqs.length;i++){
                (function(mq){
                    mq.notifyRecv(function(ex, msg){
                        if(ex === null){
                            recved++;
                            
                            mq.ccRecv++;
                            debugTest(tmNow(), recved + " - " + mq.getName() + " - " + msg.Message.MessageBody);
                            if(recved === max_msg) done(); // all messages have been received
                            return true; // auto delete msg
                        }
                        else{
                            console.warn(mq.getName(), ex);
                        }
                    }, 5);
                })(mqs[i]);
            }
        });
        
        it('#stopRecv', function(done){
            var stopped = 0;
            for(var i=0;i<mqs.length;i++){
                (function(mq){
                    mq.notifyStopP().then(function(){
                        stopped++;
                        
                        debugTest(tmNow(), mq.getName() + " stopped.");
                        if(stopped === mqs.length) done(); // all mq has stopped.
                    });
                })(mqs[i]);
            }
        });
    });
    
    // help time
    var tmNow = function(){
        var tm = new Date();
        return tm.getMinutes() + ":" + tm.getSeconds() + "." + tm.getMilliseconds()
    }
});