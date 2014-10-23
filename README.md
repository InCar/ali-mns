#ali-mqs
-----

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
    mq.sendP("Hello ali-mqs").then(console.log, console.log);

#Promised
The ali-mqs use the [promise](https://www.npmjs.org/package/promise) pattern.
Any functions suffix with 'P' indicate a promise object will be return from it.

#Typescript
Most source files are written in typescript instead of javascript.
Visit [http://www.typescriptlang.org/](http://www.typescriptlang.org/) for more information about typescript.

Please use 'grunt' to compile ts files into a single index.js file after downloading source files. 

#API Reference
##Account
The *Account* class store your ali account information. Construct an account object is simple:

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");

The account object is usually passed as argument for other class such as *MQ*

##account.getOwnerId()
Return the ali owner id.

##account.getKeyId()
Return the ali key id.

##MQS
The *MQS* operate the mqs queue.

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mqs = new AliMQS.MQS(account, "hangzhou");

The 1st argument is an account object.

The 2nd argument is optional. it can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mqs service.
Default is "hangzhou".

##mqs.listP()
List all of the queue in a data center.

    mqs.listP().then(console.log, console.log);

##MQ
The *MQ* operate the message in a queue.

    var AliMQS = require("ali-mqs");
    var account = new AliMQS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMQS.MQ("myAliMQ", account, "hangzhou");

The 1st argument is the name of mq.

The 2nd argument is an account object.

The 3rd argument is optional. it can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mqs service.
Default is "hangzhou".

##mq.sendP(message)
Send a message to the queue.

message: String. The content that sent to queue.

##mq.recvP(waitSeconds)
Receive a message from queue.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.

##mq.deleteP(receiptHandle)
Delete a message from queue.
A message will be invisible for a short time when be received.
A message must be deleted after processed, otherwise it can be received again.

receiptHandle: String.

    mq.recvP(5).then(function(data){
        return mq.deleteP(data.Message.ReceiptHandle);
    }).then(function(){
        console.log("Delete succeed!");
    });

##mq.notifyRecv(callback)
Register a callback function to receive messages.

The callback function will be called once for each received message.
And if the callback function return *true*, the message received will be delete automatically.

    mq.notifyRecv(function(err, message){
        console.log(message);
        return true; // this will cause message to be deleted automatically
    });


Both callback functions will work if you call notifyRecv twice for 2 different callback functions.
But each received message only will trigger one of them only. 

##mq.notifyStopP()
Stop mq.notifyRecv working.

    mq.notifyStopP().then(function(){
        console.log("The receiving loop has been stopped!");
    });

#License
MIT
