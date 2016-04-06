// mocha test

var assert = require("assert");
var Path = require("path");
var fs = require("fs");
var Promise = require("promise");
var AliMNS = require(Path.join(__dirname, "../index.js"));

describe.only('AliMNS-topic', function(){
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
        // Topic截至2016年4月时仅有深圳可用
        aliCfg.region = "shenzhen";
    }
    var account = new AliMNS.Account(aliCfg.accountId, aliCfg.keyId, aliCfg.keySecret);
    var mns = new AliMNS.MNSTopic(account, aliCfg.region);
    
    describe('Topic', function(){
        this.timeout(1000 * 5);
        
        var topicName = aliCfg.mqName + Math.floor(Math.random() * 10000);
        var subName = topicName + '-sub' + Math.floor(Math.random() * 10000);
        var topic = new AliMNS.Topic(topicName, account, aliCfg.region);
        var subscription = new AliMNS.Subscription(subName, topic);
        
        it('#createTopicP', function(done){
            mns.createTopicP(topicName, {
                MaximumMessageSize: 65536,
                LoggingEnabled: false
            }).then(function(data){ done(); }, done);
        });
        
        it('#listTopicP', function(done){
            mns.listTopicP(topicName, 1).then(function(data){
                // console.info(data.Topics.Topic);
                done(); }, done);
        });
        
        it('#setAttrsP & #getAttrsP', function(done){
            var testSource = 1024;
            
            topic.setAttrsP({ MaximumMessageSize: testSource })
            .then(function(dataSet){
                // console.info(dataSet);
                return topic.getAttrsP();
            })
            .then(function(dataGet){
                // console.info(dataGet);
                assert.equal(dataGet.Topic.MaximumMessageSize, testSource);
            })
            .then(function(){ done(); }, done);
        });
        
        it('#subscribe', function(done){
            topic.subscribeP(subName, "http://www.baidu.com",
                AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY,
                AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED)
            .then(function(data){
                // console.info(data); 
            done(); }, done);
        });
        
        it('#listP', function(done){
            topic.listP().then(function(data){
                // console.info(data.Subscriptions);
            done(); }, done);
        });
        
        it('Subscription #setAttrsP & #getAttrsP', function(done){
            subscription.setAttrsP({ NotifyStrategy: AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY })
            .then(function(dataSet){
                // console.info(dataSet);
                return subscription.getAttrsP();
            })
            .then(function(dataGet){
                // console.info(dataGet);
                assert.equal(dataGet.Subscription.NotifyStrategy, AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY);
            })
            .then(function(){ done(); }, done);
        });
        
        it('#unsubscribe', function(done){
            topic.unsubscribeP(subName)
            .then(function(){ done(); }, done);
        });
        
        it('#deleteTopicP', function(done){
            mns.deleteTopicP(topicName)
            .then(function(){ done(); }, done);
        });
    });
});