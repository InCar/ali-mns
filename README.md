#ali-mqs
-----
[![npm version](https://badge.fury.io/js/ali-mqs.svg)](http://badge.fury.io/js/ali-mqs)

The nodejs sdk for aliyun mqs service.

Ali MQS service is a MQ(message queue) service provided by AliYun.
The world largest online sales website www.taobao.com is heavily relying on it.

You can visit [http://www.aliyun.com/product/mqs](http://www.aliyun.com/product/mqs) for more details. 

#QuickStart
Use 'npm install ali-mqs' to install the package.

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMQS.MQ("<your-mq-name>", account, "hangzhou");
    // send message
    mq.sendP("Hello ali-mqs").then(console.log, console.error);

#Promised
The ali-mqs use the [promise](https://www.npmjs.org/package/promise) pattern.
Any functions suffix with 'P' indicate a promise object will be returned from it.

#Typescript
Most source files are written in typescript instead of javascript.
Visit [http://www.typescriptlang.org/](http://www.typescriptlang.org/) for more information about typescript.

Please use 'grunt' to compile ts files into a single index.js file after downloading source files. 

#API Reference
##Account(ownerId, keyId, keySecret)
The *Account* class store your ali account information. Construct an account object is simple:

ownerId: String, ali owner id.

keyId: String, ali key id.

keySecret: String, ali key secret.

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");

The account object is usually passed as an argument for other class such as *MQS*, *MQ*

##account.getOwnerId()
Return the ali owner id.

##account.getKeyId()
Return the ali key id.

##MQS(account, region)
The *MQS* operate the mqs queue.

account: An account object.

region: String, optional. It can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mqs service.
Default is "hangzhou".

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mqs = new AliMQS.MQS(account, "hangzhou");

##mqs.listP(prefix, pageSize, pageMarker)
List all of the queue in a data center.

prefix: String, optional. Return only mq with the prefix.

pageSize: number, optional. How many mqs will be returned in a page, 1~1000, default is 1000.

pageMarker: String, optional. Request the next page, the value is returned in last call.

    mqs.listP("my", 20).then(function(data){
        console.log(data);
        return mqs.listP("my", 20, data.Queues.NextMarker);
    }).then(function(dataP2){
        console.log(dataP2);
    }, console.error);

##mqs.createP(name, <a name="options">options</a>)
Create a mq.

name: String. The queue name.

options: optional. The queue attributes.

options.DelaySeconds: number. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.

options.MaximumMessageSize: number. How many bytes could the message be. 1024(1k)~65536, default is 65536(64k).

options.MessageRetentionPeriod: number. How many seconds will the messages live, 60~1296000(15days), default is 345600(4days).

optiions.VisibilityTimeout: number. How many seconds will the message keep invisible after be received, 1~43200(12hours), default is 30.

options.PollingWaitSeconds: numer. How many seconds will the receive request wait for if mq is empty. 0~30, default is 0.

    mqs.createP("myAliMQ", {
        DelaySeconds: 0,
        MaximumMessageSize: 65536,
        MessageRetentionPeriod: 345600,
        VisibilityTimeout: 30,
        PollingWaitSeconds: 0
    }).then(console.log, console.error);

If a mq with same name exists, calling createP will succeed only when all of the mq attributes are all same.
Any mismatched attributes will cause an "QueueAlreadyExist" failure.

##mqs.deleteP(name)
Delete an mq.

name: String. The queue name.

    mqs.deleteP("myAliMQ").then(console.log, console.error);;

##MQ(name, account, region)
The *MQ* operate the message in a queue.

name: String. The name of mq.

account: An account object.

region: String, optional. It can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mqs service.
Default is "hangzhou".

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMQS.MQ("myAliMQ", account, "hangzhou");

##mq.sendP(message, priority, delaySeconds)
Send a message to the queue.

message: String. The content that sent to queue.

priority: number, optional. 1(lowest)~16(highest), default is 8.

delaySeconds: number, optional. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.

    mq.sendP("Hello Ali-MQS", 8, 0).then(console.log, console.error);

##mq.recvP(waitSeconds)
Receive a message from queue.
This will change the message to invisible for a while.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.

    mq.recvP(5).then(console.log, console.error);

##mq.peekP()
Peek a message.
This will not change the message to invisible.

    mq.peekP(5).then(console.log, console.error);

##mq.deleteP(receiptHandle)
Delete a message from queue.
A message will be invisible for a short time after received.
A message must be deleted after processed, otherwise it can be received again.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv.

    mq.recvP(5).then(function(data){
        return mq.deleteP(data.Message.ReceiptHandle);
    }).then(console.log, console.error);

##mq.reserveP(receiptHandle, reserveSeconds)
Reserve a received message.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv.

reserveSeconds: number. How long will the message be reserved, in seconds. 1~43200(12hours).

    mq.recvP().then(function(data){
            return mq.reserveP(data.Message.ReceiptHandle, 120);
    }).then(function(dataReserved){
            return mq.deleteP(dataReserved.ChangeVisibility.ReceiptHandle);
    });


If you need more time to process the message after received, you can reserve it for a longer time.
The message will continue to keep invisible for reserveSeconds from now.
Set a shorter time is also possible.
If succeed, a new receiptHandle will be returned to replace the old one, further mq.deleteP or mq.reserveP should use the newer.
And the newer receiptHandle will expired after reserveSeconds past.

##mq.notifyRecv(callback, waitSeconds)
Register a callback function to receive messages.

callback: The callback function will be called once for each received message.
And if the callback function return *true*, the message received will be delete automatically,
while you should delete the message manually, if return *false*.

waitSeconds: number, optional. 1~30. The max seconds to wait in a polling loop, default is 5.
At the begin of a polling loop, it will check if mq.notifyStopP has been called, So the bigger number
will cause a slowly mq.notifyStopP.
Set waitSeconds to 0 ,will actually use the default value 5 seconds instead.

    mq.notifyRecv(function(err, message){
        console.log(message);
        return true; // this will cause message to be deleted automatically
    });


Both callback functions will work if you call notifyRecv twice for 2 different callback functions.
But each received message only will trigger one of them only. 

##mq.notifyStopP()
Stop mq.notifyRecv working. The promise object returned will not be resolved until the receiving loop stopped actually.
The max time wait for notifyRecv() stop is determined by waitSeconds passed to mq.notifyRecv.

    mq.notifyStopP().then(console.log, console.error);

##mq.getAttrsP()
Get the attributes of the mq.

    mq.getAttrsP().then(console.log, console.error);

##mq.setAttrsP(options)
Modify the attributes of mq.

options: the queue attributes. See the [options](#options) of mqs.createP.

    mq.setAttrsP({
        DelaySeconds: 0,
        MaximumMessageSize: 65536,
        MessageRetentionPeriod: 345600,
        VisibilityTimeout: 30,
        PollingWaitSeconds: 0
    }).then(console.log, console.error);

#License
MIT
