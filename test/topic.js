// mocha test

var assert = require("assert");
var Path = require("path");
var fs = require("fs");
var http = require("http");
var Promise = require("promise");
var AliMNS = require(Path.join(__dirname, "../index.js"));

describe('AliMNS-topic', function(){
    // ali account configuration
    var aliCfg = {
        accountId: "your-account-id",
        keyId: "your-key-id",
        keySecret: "your-key-secret",
        region: "hangzhou",
        topicName: "dev",
        endPoint: "https://www.baidu.com/ali-mns-ep",
        port: 80
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
        
        var topicName = aliCfg.topicName + Math.floor(Math.random() * 10000);
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
            topic.subscribeP(subName, aliCfg.endPoint,
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
        
        it('#publishP', function(done){
            topic.publishP("Hello")
            .then(function(data){
                // console.info(data); 
            done(); }, done);
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
    
    describe.only('Topic-Notify', function(){
        this.timeout(1000 * 10);
        
        var topicName = aliCfg.topicName + Math.floor(Math.random() * 10000);
        var subName = topicName + '-sub' + Math.floor(Math.random() * 10000);
        var topic = new AliMNS.Topic(topicName, account, aliCfg.region);
        var server = null;
        
        it('prepare-create-topic', function(done){
            mns.createTopicP(topicName)
            .then(function(){ done(); }, done);
        });
        
        it('prepare-subscribe', function(done){
            topic.subscribeP(subName, aliCfg.endPoint,
                AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY,
                AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED)
            .then(function(){ done(); }, done);
        });
        
        it('prepare-http', function(done){
            server = http.createServer((request, response)=>{
                console.info("------> received");
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end('ok');
            });
            server.listen(aliCfg.port);
            done();
        });
        
        it('publish', function(done){
            topic.publishP("Hello")
            .then(function(){ done(); }, done);
        });
        
        it('wait-notify', function(done){
            setTimeout(()=>{
                done();
            }, 1000*8);
        });
        
        it('clean-topic', function(done){
            mns.deleteTopicP(topicName)
            .then(function(){ done(); }, done);
        });
    });
});