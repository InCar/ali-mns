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
        var topic = new AliMNS.Topic(topicName, account, aliCfg.region);
        
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
        
        it('#deleteTopicP', function(done){
            mns.deleteTopicP(topicName)
            .then(function(){ done(); }, done);
        });
    });
});