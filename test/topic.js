// mocha test

var assert = require("assert");
var Path = require("path");
var fs = require("fs");
var http = require("http");
var Promise = require("promise");
var AliMNS = require(Path.join(__dirname, "../index.js"));

describe('AliMNS-topic', ()=>{
    // ali account configuration
    var aliCfg = {
        accountId: process.env.aliyun_accountId || "your-account-id",
        keyId: process.env.aliyun_keyId || "your-key-id",
        keySecret: process.env.aliyun_keySecret || "your-key-secret",
        region: process.env.TRAVIS == "true" ? new AliMNS.Region(AliMNS.City.SiliconValley): new AliMNS.Region(AliMNS.City.Hangzhou),
        topicName: process.env.aliyun_topicName || "dev",
        endPoint: process.env.aliyun_endPoint || "https://www.baidu.com/ali-mns-ep",
        port: process.env.aliyun_port || 80
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
        
        it('#createTopicP', (done)=>{
            mns.createTopicP(topicName, {
                MaximumMessageSize: 65536,
                LoggingEnabled: false
            }).then((data)=>{ done(); }, done);
        });
        
        it('#listTopicP', (done)=>{
            mns.listTopicP(topicName, 1).then((data)=>{
                // console.info(data.Topics.Topic);
                done(); }, done);
        });
        
        it('#setAttrsP & #getAttrsP', (done)=>{
            var testSource = 1024;
            
            topic.setAttrsP({ MaximumMessageSize: testSource })
            .then((dataSet)=>{
                // console.info(dataSet);
                return topic.getAttrsP();
            })
            .then((dataGet)=>{
                // console.info(dataGet);
                assert.equal(dataGet.Topic.MaximumMessageSize, testSource);
            })
            .then(()=>{ done(); }, done);
        });
        
        it('#subscribe', (done)=>{
            topic.subscribeP(subName, aliCfg.endPoint,
                AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY,
                AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED)
            .then((data)=>{
                // console.info(data); 
            done(); }, done);
        });
        
        it('#listP', (done)=>{
            topic.listP().then((data)=>{
                // console.info(data.Subscriptions);
            done(); }, done);
        });
        
        it('Subscription #setAttrsP & #getAttrsP', (done)=>{
            subscription.setAttrsP({ NotifyStrategy: AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY })
            .then((dataSet)=>{
                // console.info(dataSet);
                return subscription.getAttrsP();
            })
            .then((dataGet)=>{
                // console.info(dataGet);
                assert.equal(dataGet.Subscription.NotifyStrategy, AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY);
            })
            .then(()=>{ done(); }, done);
        });
        
        it('#publishP', (done)=>{
            topic.publishP("Hello", false, null, null, {forever:true})
            .then((data)=>{
                // console.info(data); 
            done(); }, done);
        });
        
        it('#unsubscribe', (done)=>{
            topic.unsubscribeP(subName)
            .then(()=>{ done(); }, done);
        });
        
        it('#deleteTopicP', (done)=>{
            mns.deleteTopicP(topicName)
            .then(()=>{ done(); }, done);
        });
    });
    
    describe('Topic-Notify', function(){
        this.timeout(1000 * 10);
        
        var topicName = aliCfg.topicName + Math.floor(Math.random() * 10000);
        var subName = topicName + '-sub' + Math.floor(Math.random() * 10000);
        var topic = new AliMNS.Topic(topicName, account, aliCfg.region);
        var server = null;
        var nx = null;
        
        it('prepare-create-topic', (done)=>{
            mns.createTopicP(topicName)
            .then(()=>{ done(); }, done);
        });
        
        it('prepare-subscribe', (done)=>{
            topic.subscribeP(subName, aliCfg.endPoint,
                AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY,
                AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED)
            .then(()=>{ done(); }, done);
        });
        
        it('prepare-http', ()=>{
            nx = new Promise((resolve, reject)=>{
                server = http.createServer((request, response)=>{
                    var chunks = [];
                    request.on('data', (chunk)=>{
                        chunks.push(chunk);
                    });
                    request.on('end', ()=>{
                        var buf = Buffer.concat(chunks);
                        
                        response.writeHead(204, {'Content-Type': 'text/plain'});
                        response.end();
                        resolve({
                            url: request.url,
                            headers: request.headers,
                            data: buf.toString()
                        });
                    });
                    
                    
                });
                server.listen(aliCfg.port);
            });
        });
        
        it.skip('wait-notify', (done)=>{
            var tmo = setTimeout(()=>{
                done(new Error("timeout"));
            }, 1000*8);
            nx.then((data)=>{
                console.info(data);
                clearTimeout(tmo);
                done();
            });
            topic.publishP("Hello");
        });
        
        it('clean', (done)=>{
            server.close();
            mns.deleteTopicP(topicName)
            .then(()=>{ done(); }, done);
        });
    });
});