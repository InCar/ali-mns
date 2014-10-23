#ali-mqs
=======

The nodejs sdk for aliyun mqs service.

#QuickStart
Use 'npm install ali-mqs' to install the package.

    var AliMQS = require("ali-mqs");
    var aliCfg = {
        ownerId: "<your-owner-id>",
        keyId: "<your-key-id>",
        keySecret: "<your-key-secret>",
        region: "hangzhou",
        mqName: "<your-mq-name>"
    };
    var account = new AliMQS.Account(aliCfg.ownerId, aliCfg.keyId, aliCfg.keySecret);
    // fetch all of the mqs 
    var mqs = new AliMQS.MQS(account, aliCfg.region);
    mqs.listP().then(console.log);
    // send message
    var mq = new AliMQS.MQ(aliCfg.mqName, account, aliCfg.region);
    mq.sendP("Hello ali-mqs").then(console.log);
    // receive and delete message
    mq.recvP().then(function(message){
        console.log(message);
        mq.deleteP(Message.ReceiptHandle);
    }, function(err){
        console.log(err);
    });