# ali-mns (ali-mqs)
[![npm version](https://badge.fury.io/js/ali-mns.svg)](http://badge.fury.io/js/ali-mns)
[![npm version](https://badge.fury.io/js/ali-mqs.svg)](http://badge.fury.io/js/ali-mqs)

The nodejs sdk for aliyun mns service

[阿里云消息服务-简体中文-帮助手册](http://armclr.azurewebsites.net/Links/AliMNS?lang=zh-Hans)

Ali MNS service is a MQ(message queue) service provided by AliYun.
The world largest online sales website www.taobao.com is heavily relying on it.

You can visit [http://www.aliyun.com/product/mns](http://www.aliyun.com/product/mns) for more details.

The original Ali-MQS service has been upgraded and changed it's name to Ali-MNS since June, 2015.
Go to  [Migrate](#migrate) part for the old version informations.

# QuickStart
Use 'npm install ali-mns' to install the package.

```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMNS.MQ("<your-mq-name>", account, "hangzhou");
    // send message
    mq.sendP("Hello ali-mns").then(console.log, console.error);
```
More sample codes can be found in [GitHub](https://github.com/InCar/ali-mns/tree/master/test).

# Promised
The ali-mns use the [promise](https://www.npmjs.org/package/promise) pattern.
Any functions suffix with 'P' indicate a promise object will be returned from it.

# Typescript
If you only want to use it, forget this.

Most source files are written in typescript instead of javascript.
Visit [http://www.typescriptlang.org/](http://www.typescriptlang.org/) for more information about typescript.

If you interest in source file, visit GitHub [https://github.com/InCar/ali-mns](https://github.com/InCar/ali-mns)

Please use 'gulp' to compile ts files into a single index.js file after downloading source files. 

# API Reference
<table>
    <tr>
        <th>CLASS</th>
        <th>METHOD</th>
        <th>DESCRIPTION</th>
    </tr>
    <tr>
        <td rowspan="6">[Account](#accountaccountidstring-keyidstring-keysecretstring)</td>
        <td colspan="2">The *Account* class store your ali account information.</td>
    </tr>
    <tr>
        <td>[getAccountId](#accountgetaccountid)</td>
        <td>Return the ali account id.</td>
    </tr>
    <tr>
        <td>[getOwnerId](#accountgetownerid)</td>
        <td>Same as account.getAccountId(). For compatible v1.x.</td>
    </tr>
    <tr>
        <td>[getKeyId](#accountgetkeyid)</td>
        <td>Return the ali key id.</td>
    </tr>
    <tr>
        <td>[getGA](#accountgetga--accountsetgabgaboolean)</td>
        <td>Gets the status of google analytics collection.</td>
    </tr>
    <tr>
        <td>[setGA](#accountgetga--accountsetgabgaboolean)</td>
        <td>Sets the status of google analytics collection.</td>
    </tr>
    <tr>
        <td rowspan="2">[Region](#regioncitystringcity-networkstringnetworktype-zonestringzone)</td>
        <td colspan="2">The *Region* class help your specifying the region of datacenter.</td>
    </tr>
    <tr>
        <td>[toString](#regiontostring)</td>
        <td>Convert region object to string value.</td>
    </tr>
    <tr>
        <td rowspan="4">[MNS](#mnsaccountaccount-regionstring)<br/>[MQS](#mqsaccountaccount-regionstring)<br/>[MNSTopic](#mnstopicaccountaccount-regionstring)</td>
        <td colspan="2">Operate the mns queue. The *MQS* is for compatible v1.x.</td>
    </tr>
    <tr>
        <td>[listP](#mnslistpprefixstring-pagesizenumber-pagemarkerstring)</td>
        <td>List all of the queue in a data center.</td>
    </tr>
    <tr>
        <td>[createP](#mnscreatepnamestring-optionsany)</td>
        <td>Create a mq.</td>
    </tr>
    <tr>
        <td>[deleteP](#mnsdeletepnamestring)</td>
        <td>Delete an mq.</td>
    </tr>
    <tr>
        <td rowspan="15">[MQ](#mqnamestring-accountaccount-regionstring)<br/>[MQBatch](#mqbatch)</td>
        <td colspan="2">The *MQ* operate the message in a queue.</td>
    </tr>
    <tr>
        <td>[getName](#mqgetname)</td>
        <td>Gets the name of mq.</td>
    </tr>
    <tr>
        <td>[getAccount](#mqgetaccount)</td>
        <td>Gets the account of mq.</td>
    </tr>
    <tr>
        <td>[getRegion](#mqgetregion)</td>
        <td>Gets the region of mq.</td>
    </tr>
    <tr>
        <td>[sendP](#mqsendpmsgstring-prioritynumber-delaysecondsnumber)</td>
        <td>Send a message to the queue.</td>
    </tr>
    <tr>
        <td>[getRecvTolerance](#mqgetrecvtolerance--mqsetrecvtolerancevaluenumber)</td>
        <td>Gets the tolerance seconds for mq.recvP method.</td>
    </tr>
    <tr>
        <td>[setRecvTolerance](#mqgetrecvtolerance--mqsetrecvtolerancevaluenumber)</td>
        <td>Sets the tolerance seconds for mq.recvP method.</td>
    </tr>
    <tr>
        <td>[recvP](#mqrecvpwaitsecondsnumber)</td>
        <td>Receive a message from queue.</td>
    </tr>
    <tr>
        <td>[peekP](#mqpeekp)</td>
        <td>Peek a message.</td>
    </tr>
    <tr>
        <td>[deleteP](#mqdeletepreceipthandlestring)</td>
        <td>Delete a message from queue.</td>
    </tr>
    <tr>
        <td>[reserveP](#mqreservepreceipthandlestring-reservesecondsnumber)</td>
        <td>Reserve a received message.</td>
    </tr>
    <tr>
        <td>[notifyRecv](#mqnotifyrecvcbexerror-msganyboolean-waitsecondsnumber)</td>
        <td>Register a callback function to receive messages.</td>
    </tr>
    <tr>
        <td>[notifyStopP](#mqnotifystopp)</td>
        <td>Stop mq.notifyRecv working.</td>
    </tr>
    <tr>
        <td>[getAttrsP](#mqgetattrsp)</td>
        <td>Get the attributes of the mq.</td>
    </tr>
    <tr>
        <td>[setAttrsP](#mqsetattrspoptionsany)</td>
        <td>Modify the attributes of mq.</td>
    </tr>
    <tr>
        <td rowspan="6">[MQBatch](#mqbatch)</td>
        <td colspan="2">Provide the batch process model introduced in a new edtion of Ali-MNS service in June, 2015.</td>
    </tr>
    <tr>
        <td>[sendP](#mqbatchsendpmsgstring--array-prioritynumber-delaysecondsnumber)</td>
        <td>Send a message or batch send messages to the queue.</td>
    </tr>
    <tr>
        <td>[recvP](#mqbatchrecvpwaitsecondsnumber-numofmessagesnumber)</td>
        <td>Receive a message or batch receive messages from queue.</td>
    </tr>
    <tr>
        <td>[peekP](#mqbatchpeekpnumofmessagesnumber)</td>
        <td>Peek message(s).</td>
    </tr>
    <tr>
        <td>[deleteP](#mqbatchdeletepreceipthandlestring--array)</td>
        <td>Delete a message or messages from queue.</td>
    </tr>
    <tr>
        <td>[notifyRecv](#mqbatchnotifyrecvcbexerror-msganyboolean-waitsecondsnumber-numofmessagesnumber)</td>
        <td>Register a callback function to receive messages in batch</td>
    </tr>
    <tr>
        <td rowspan="4">[Msg](#msgmsg-string-prioritynumber-delaysecondsnumber)</td>
        <td colspan="2">A simple message define, used in MQBatch.</td>
    </tr>
    <tr>
        <td>[getMsg](#msggetmsg)</td>
        <td>Return the content of message.</td>
    </tr>
    <tr>
        <td>[getPriority](#msggetpriority)</td>
        <td>Return the priority of message.</td>
    </tr>
    <tr>
        <td>[getDelaySeconds](#msggetdelayseconds)</td>
        <td>Return the delay seconds of message.</td>
    </tr>
    <tr>
        <td rowspan="4">[MNSTopic](#mnstopicaccountaccount-regionstring)</td>
        <td colspan="2">The class MNSTopic extends class MNS for providing features in topic model.</td>
    </tr>
    <tr>
        <td>[listTopicP](#mnslisttopicpprefixstring-pagesizenumber-pagemarkerstring)</td>
        <td>List all topics.</td>
    </tr>
    <tr>
        <td>[createTopicP](#mnscreatetopicpnamestring-optionsany)</td>
        <td>Create a topic.</td>
    </tr>
    <tr>
        <td>[deleteTopicP](#mnsdeletetopicpnamestring)</td>
        <td>Delete a topic.</td>
    </tr>
    <tr>
        <td rowspan="10">[Topic](#topicnamestring-accountaccount-regionstring)</td>
        <td colspan="2">Operate a topic.</td>
    </tr>
    <tr>
        <td>[getName](#topicgetname)</td>
        <td>Get topic name.</td>
    </tr>
    <tr>
        <td>[getAccount](#topicgetaccount)</td>
        <td>Get topic account.</td>
    </tr>
    <tr>
        <td>[getRegion](#topicgetregion)</td>
        <td>Get topic region.</td>
    </tr>
    <tr>
        <td>[getAttrsP](#topicgetattrsp--topicsetattrspoptionsany)</td>
        <td>Get attributes of topic.</td>
    </tr>
    <tr>
        <td>[setAttrsP](#topicgetattrsp--topicsetattrspoptionsany)</td>
        <td>Set attributes of topic.</td>
    </tr>
    <tr>
        <td>[listP](#topiclistpprefixstring-pagesizenumber-pagemarkerstring)</td>
        <td>List all subscriptions.</td>
    </tr>
    <tr>
        <td>[subscribeP](#topicsubscribepnamestring-endpointstring-notifystrategystring-notifycontentformatstring-filtertagstring)</td>
        <td>Subscribe a topic.</td>
    </tr>
    <tr>
        <td>[unsubscribeP](#topicunsubscribepnamestring)</td>
        <td>Unsubscribe a topic.</td>
    </tr>
    <tr>
        <td>[publishP](#topicpublishpmsgstring-b64boolean-tagstring-attrsany)</td>
        <td>Publish a message to a topic.</td>
    </tr>
    <tr>
        <td rowspan="7">[Subscription](#subscriptionnamestring-topictopic)</td>
        <td colspan="2">Operate a subscription.</td>
    </tr>
    <tr>
        <td>[getName](#subscriptiongetname)</td>
        <td>Get name of subscription.</td>
    </tr>
    <tr>
        <td>[getTopic](#subscriptiongettopic)</td>
        <td>Get topic of subscription.</td>
    </tr>
    <tr>
        <td>[getAttrsP](#subscriptiongetattrsp--subscriptionsetattrspoptionsany)</td>
        <td>Get attributes of subscription.</td>
    </tr>
    <tr>
        <td>[setAttrsP](#subscriptiongetattrsp--subscriptionsetattrspoptionsany)</td>
        <td>Set attributes of subscription.</td>
    </tr>
    <tr>
        <td>[NotifyStrategy](#subscriptionnotifystrategy)</td>
        <td>NotifyStrategy constant.</td>
    </tr>
    <tr>
        <td>[NotifyContentFormat](#subscriptionnotifycontentformat)</td>
        <td>NotifyContentFormat constant</td>
    </tr>
<table>


## Account(accountId:string, keyId:string, keySecret:string)
The *Account* class store your ali account information. Construct an account object is simple:

accountId: String, ali account id.

keyId: String, ali key id.

keySecret: String, ali key secret.
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
```
The account object is usually passed as an argument for other class such as *MNS*, *MQ*

Follow [this link](https://ak-console.aliyun.com/#/accesskey) to find yours

## account.getAccountId()
Return the ali account id.

## account.getOwnerId()
Same as account.getAccountId(). For compatible v1.x.

## account.getKeyId()
Return the ali key id.

## account.getGA() & account.setGA(bGA:boolean)
Gets or Sets the status of google analytics collection.
Set `bGA` to `true` for enabling google analytics, while set to `false` for disabling google analytics.
See [Privacy Policy](#privacy-policy).

## Region(city?:string|City, network?:string|NetworkType, zone?:string|Zone)
The *Region* class help your specifying the region of datacenter.

city: String | City, optional. It can be the data center name, like "hangzhou", "beijing" or "west-1", "southeast-2";
or it can be a pre-defined city enum value, like `AliMNS.City.Beijing`, `AliMNS.City.Tokyo`, check [Region.ts#L169-L188](ts/Region.ts#L169-L188) for the full list.
The default is "hangzhou".

network: String | NetworkType, optional.
If it is a string, should be ""(empty string) or "-internal" or "-internal-vpc".
If it is [NetworkType](ts/Region.ts#L144-L148) enum, should be `AliMNS.NetworkType.Public` or `AliMNS.NetworkType.Internal` or `AliMNS.NetworkType.VPC`.
The default is ""(empty string), means `AliMNS.NetworkType.Public` network.

zone: String | Zone, optional.
If it is a string, should be data center zone, like "cn", "us", "eu", "me" or "ap".
If it is [Zone](ts/Region.ts#L150-L156) enum, should be `AliMNS.Zone.China`, `AliMNS.Zone.AsiaPacific`, `AliMNS.Zone.Europe`, `AliMNS.Zone.UniteState` or `AliMNS.Zone.MiddleEast`.
The default is "cn", means `AliMNS.Zone.China`.
This value will be ignored if city parameter is a pre-defined city enum value, because we can deduce zone from city.

samples
```javascript
// because hangzhou is the default value.
var regionHangzhou = new AliMNS.Region(); 

// beijing public network in china
var regionBeijing = new AliMNS.Region("beijing");
regionBeijing = new AliMNS.Region(AliMNS.City.Beijing);
regionBeijing = new AliMNS.Region("beijing", "");
regionBeijing = new AliMNS.Region("beijing", AliMNS.NetworkType.Public);
regionBeijing = new AliMNS.Region("beijing", "", "cn");

// east asia in internal network
var regionJapan = new AliMNS.Region(AliMNS.City.Japan, AliMNS.NetworkType.Internal);
regionJapan = new AliMNS.Region("northeast-1", AliMNS.NetworkType.Internal, "ap");
regionJapan = new AliMNS.Region("northeast-1", "-internal", "ap");

// south asia in vpc network
var regionSingapore = new AliMNS.Region(AliMNS.City.Singapore, AliMNS.NetworkType.VPC);
regionSingapore = new AliMNS.Region(AliMNS.City.Singapore, "-internal-vpc");
regionSingapore = new AliMNS.Region("southeast-1", "-internal-vpc", AliMNS.Zone.AsiaPacific);
regionSingapore = new AliMNS.Region("southeast-1", "-internal-vpc", "ap");
```

## region.toString()
Convert region object to string value.

## MNS(account:Account, region?:string|Region)
The *MNS* operate the mns queue.

account: An account object.

region: String|Region, optional. 
If it is string, it can be "hangzhou", "beijing" or any Chinese datacenter city name.
If it is Region, it allows you to specify data center other than in China. 
Default is "hangzhou". It can also be internal or vpc address "hangzhou-internal", "beijing-internal" or "qingdao-internal-vpc".
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    var mns = new AliMNS.MNS(account, "hangzhou");
    // or
    var regionJapan = new AliMNS.Region(AliMNS.City.Japan, AliMNS.NetworkType.Public);
    var mnsJapan = new AliMNS.MNS(account, regionJapan);
```

## mns.switchHttps(bHttps:boolean):void
Switch to use https or http protocol. The default is `http`.

bHttps: boolean. true to use `https` while false to use `http`.

## MQS(account:Account, region?:string|Region)
Same as MNS. For compatible v1.x.

## mns.listP(prefix?:string, pageSize?:number, pageMarker?:string)
List all of the queue in a data center.

prefix: String, optional. Return only mq with the prefix.

pageSize: number, optional. How many mns will be returned in a page, 1~1000, default is 1000.

pageMarker: String, optional. Request the next page, the value is returned in last call.
```javascript
    mns.listP("my", 20).then(function(data){
        console.log(data);
        return mns.listP("my", 20, data.Queues.NextMarker);
    }).then(function(dataP2){
        console.log(dataP2);
    }, console.error);
```

## mns.createP(name:string, <a name="options">options</a>?:any)
Create a mq.

name: String. The queue name.

options: optional. The queue attributes.

options.DelaySeconds: number. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.

options.MaximumMessageSize: number. How many bytes could the message be. 1024(1k)~65536, default is 65536(64k).

options.MessageRetentionPeriod: number. How many seconds will the messages live, 60~1296000(15days), default is 345600(4days).

optiions.VisibilityTimeout: number. How many seconds will the message keep invisible after be received, 1~43200(12hours), default is 30.

options.PollingWaitSeconds: numer. How many seconds will the receive request wait for if mq is empty. 0~30, default is 0.
```javascript
    mns.createP("myAliMQ", {
        DelaySeconds: 0,
        MaximumMessageSize: 65536,
        MessageRetentionPeriod: 345600,
        VisibilityTimeout: 30,
        PollingWaitSeconds: 0
    }).then(console.log, console.error);
```
If a mq with same name exists, calling createP will succeed only when all of the mq attributes are all same.
Any mismatched attributes will cause an "QueueAlreadyExist" failure.

## mns.deleteP(name:string)
Delete an mq.

name: String. The queue name.
```javascript
    mns.deleteP("myAliMQ").then(console.log, console.error);;
```

## MQ(name:string, account:Account, region?:string)
The *MQ* operate the message in a queue.

name: String. The name of mq.

account: An account object.

region: String, optional. It can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mns service.
Default is "hangzhou". It can also be internal address "hangzhou-internal", "beijing-internal" or "qingdao-internal".
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMNS.MQ("myAliMQ", account, "hangzhou");
```

## mq.getName()
Gets the name of mq.

## mq.getAccount()
Gets the account of mq.

## mq.getRegion()
Gets the region of mq.

## mq.sendP(msg:string, priority?:number, delaySeconds?:number)
Send a message to the queue.

message: String. The content that sent to queue.

priority: number, optional. 1(lowest)~16(highest), default is 8.

delaySeconds: number, optional. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.
```javascript
    mq.sendP("Hello Ali-MNS", 8, 0).then(console.log, console.error);
```

## mq.getRecvTolerance() & mq.setRecvTolerance(value:number)
Gets or sets the tolerance seconds for mq.recvP method.

value: number. Default is 5, in seconds. How long will mq.recvP wait before timeout.
Due to network lag, the return of mq.recvP method may be later than expected.

## mq.recvP(waitSeconds?:number)
Receive a message from queue.
This will change the message to invisible for a while.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.
```javascript
    mq.recvP(5).then(console.log, console.error);
```
This method will wait `waitSeconds + getRecvTolerance()` totally if queue is empty.

## mq.peekP()
Peek a message.
This will not change the message to invisible.
```javascript
    mq.peekP(5).then(console.log, console.error);
```

## mq.deleteP(receiptHandle:string)
Delete a message from queue.
A message will be invisible for a short time after received.
A message must be deleted after processed, otherwise it can be received again.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv.
```javascript
    mq.recvP(5).then(function(data){
        return mq.deleteP(data.Message.ReceiptHandle);
    }).then(console.log, console.error);
```

## mq.reserveP(receiptHandle:string, reserveSeconds:number)
Reserve a received message.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv.

reserveSeconds: number. How long will the message be reserved, in seconds. 1~43200(12hours).
```javascript
    mq.recvP().then(function(data){
            return mq.reserveP(data.Message.ReceiptHandle, 120);
    }).then(function(dataReserved){
            return mq.deleteP(dataReserved.ChangeVisibility.ReceiptHandle);
    });
```
If you need more time to process the message after received, you can reserve it for a longer time.
The message will continue to keep invisible for reserveSeconds from now.
Set a shorter time is also possible.
If succeed, a new receiptHandle will be returned to replace the old one, further mq.deleteP or mq.reserveP should use the newer.
And the newer receiptHandle will expired after reserveSeconds past.

## mq.notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number)
Register a callback function to receive messages.

cb: The callback function will be called once for each received message.
And if the callback function return *true*, the message received will be delete automatically,
while you should delete the message manually, if return *false*.

waitSeconds: number, optional. 1~30. The max seconds to wait in a polling loop, default is 5.
At the begin of a polling loop, it will check if mq.notifyStopP has been called, So the bigger number
will cause a slowly mq.notifyStopP.
Set waitSeconds to 0 ,will actually use the default value 5 seconds instead.
```javascript
    mq.notifyRecv(function(err, message){
        console.log(message);
        if(err && err.message === "NetworkBroken"){
            // Best to restart the process when this occurs
            throw err;
        }
        return true; // this will cause message to be deleted automatically
    });
```

Both callback functions will work if you call notifyRecv twice for 2 different callback functions.
But each received message only will trigger one of them only. 

## mq.notifyStopP()
Stop mq.notifyRecv working. The promise object returned will not be resolved until the receiving loop stopped actually.
The max time wait for notifyRecv() stop is determined by waitSeconds passed to mq.notifyRecv.
```javascript
    mq.notifyStopP().then(console.log, console.error);
```

## mq.getAttrsP()
Get the attributes of the mq.

    mq.getAttrsP().then(console.log, console.error);

## mq.setAttrsP(options:any)
Modify the attributes of mq.

options: the queue attributes. See the [options](#options) of mns.createP.
```javascript
    mq.setAttrsP({
        DelaySeconds: 0,
        MaximumMessageSize: 65536,
        MessageRetentionPeriod: 345600,
        VisibilityTimeout: 30,
        PollingWaitSeconds: 0
    }).then(console.log, console.error);
```

# Msg(msg: string, priority?:number, delaySeconds?:number)
A simple message define, used in MQBatch.

msg: string. The content of message.

priority: number, optional. 1(lowest)~16(highest), default is 8.

delaySeconds: number, optional. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.
```javascript
var msg = new AliMNS.Msg("Make a test");
```

## msg.getMsg()
Return the content of message.

## msg.getPriority()
Return the priority of message.

## msg.getDelaySeconds()
Return the delay seconds of message.

# MQBatch
Provide the batch process model introduced in a new edtion of Ali-MNS service in June, 2015.
It derives from MQ, so all methods in MQ are avaiable in MQBatch too. For example, you can 
use `mqBatch.setRecvTolerance(1.2)` to adjust the timeout behavior of *mqBatch.recvP()*.
```javascript
var mqBatch = new AliMNS.MQBatch(aliCfg.mqName, account, aliCfg.region);
```

## mqBatch.sendP(msg:string | Array<Msg>, priority?:number, delaySeconds?:number)
Send a message or batch send messages to the queue.

msg: String or an array of Msg. The message(s) up to 16 that sent to queue.

priority: number, optional. Only valid when `msg` is a string, 1(lowest)~16(highest), default is 8.

delaySeconds: number, optional. Only valid when `msg` is a string. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.

If `msg` is an array of `Msg`, use the priority & delaySeconds properties of `Msg`, and ignore the 2nd and 3rd arguments.
```javascript
    var msgs = [];
    for(var i=0;i<5;i++){
        var msg = new AliMNS.Msg("BatchSend" + i, 8, 0);
        msgs.push(msg);
    }

    mqBatch.sendP(msgs);
```

## mqBatch.recvP(waitSeconds?:number, numOfMessages?:number)
Receive a message or batch receive messages from queue.
This will change the messages to invisible for a while.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.

numOfMessages: number. optional. The max number of message can be received in a batch, can be 1~16, default is 16.
```javascript
    mqBatch.recvP(5, 16).then(console.log, console.error);
```

## mqBatch.peekP(numOfMessages?:number)
Peek message(s).
This will not change the message to invisible.

numOfMessages: number. optional. The max number of message can be peeked in a batch, can be 1~16, default is 16.
```javascript
    mqBatch.peekP(5, 16).then(console.log, console.error);
```

## mqBatch.deleteP(receiptHandle:string | Array<string>)
Delete a message or messages from queue.
Messages will be invisible for a short time after received.
Messages must be deleted after processed, otherwise it can be received again.

receiptHandle: String or an array of string. Return by mq.recvP mq.notifyRecv or mqBatch.recvP mqBatch.notifyRecv.
```javascript
    var rhsToDel = [];
    mqBatch.recvP(5, 16).then(function(dataRecv){
        for(var i=0;i<dataRecv.Messages.Message.length;i++){
            rhsToDel.push(dataRecv.Messages.Message[i].ReceiptHandle);
        }
    }).then(function(){
        return mqBatch.deleteP(rhsToDel);
    }).then(console.log, console.error);
```

## mqBatch.notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number, numOfMessages?:number)
Register a callback function to receive messages in batch mode.

numOfMessages: number. optional. The max number of message can be received in a batch, can be 1~16, default is 16.

All other arguments are same as *mq.notifyRecv*.

# MNSTopic(account:Account, region?:string)
The class `MNSTopic` extends class `MNS` for providing features in topic model.
All methods in `MNS` class are also available in `MNSTopic`.
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    var mns = new AliMNS.MNSTopic(account, "shenzhen");
```
*By now(Apr. 2016), the topic model is only provided in shenzhen data center.*

## mns.listTopicP(prefix?:string, pageSize?:number, pageMarker?:string)
List all topics.

prefix: String, optional. Return only topics with the prefix.

pageSize: number, optional. How many topics will be returned in a page, 1~1000, default is 1000.

pageMarker: String, optional. Request the next page, the value is returned in last call.

## mns.createTopicP(name:string, options?:any)
Create a topic.

name: topic name.

options: optional.

options.MaximumMessageSize: int. The maximum size of message, 1024(1k)~65536(64k), default is 65536.

options.LoggingEnabled: boolean. Enable logging or not, default is false.

## mns.deleteTopicP(name:string)
Delete a topic.

name: topic name.

# Topic(name:string, account:Account, region?:string)
Operate a topic.

name: topic name.

account: An account object.

region: optional. Can be "shenzhen" or "shenzhen-internal", default is "hangzhou".

*By now(Apr. 2016), the topic model is only provided in shenzhen data center*
```javascript
var AliMNS = require("ali-mns");
var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
var topic = new AliMNS.Topic("t11", account, "shenzhen");
```

## topic.getName()
Get topic name.

## topic.getAccount()
Get topic account.

## topic.getRegion()
Get topic region.

## topic.getAttrsP() & topic.setAttrsP(options:any)
Get or set attributes of topic.

options: topic attributes.

options.MaximumMessageSize: int. The maximum size of message, 1024(1k)~65536(64k), default is 65536.

options.LoggingEnabled: boolean. Enable logging or not, default is false.

```javascript
topic.setAttrsP({ MaximumMessageSize: 1024 });
topic.getAttrsP().then((data)=>{ console.info(data); });
```

## topic.listP(prefix?:string, pageSize?:number, pageMarker?:string)
List all subscriptions.

prefix: String, optional. Return only subscriptions with the prefix.

pageSize: number, optional. How many subscriptions will be returned in a page, 1~1000, default is 1000.

pageMarker: String, optional. Request the next page, the value is returned in last call.

## topic.subscribeP(name:string, endPoint:string, notifyStrategy?:string, notifyContentFormat?:string, filterTag?:string)
Subscribe a topic.

name: Name of subscription.

endPoint: Notify end point. eg. `http://www.yoursite.com/mns-ep`

notifyStrategy: optional. BACKOFF_RETRY or EXPONENTIAL_DECAY_RETRY, default is BACKOFF_RETRY.

notifyContentFormat: optional. XML or SIMPLIFIED, default is XML.

filterTag: Optional. Only matched messages will be pushed the endPoint, max length is 16; default is *undefined*, do not filter out any messages.  

```javascript
topic.subscribeP("subx", "http://www.yoursite.com/mns-ep",
        AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY,
        AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED)
    .then(
        (data)=>{ console.info(data);}, 
        (err)=>{ console.error(err); }
    );
```

## topic.unsubscribeP(name:string)
Unsubscribe a topic.

name: Name of subscription.

## topic.publishP(msg:string, b64:boolean, tag?:string, attrs?:any)
Publish a message to a topic.

msg: content of message

b64: true, encoding msg to base64 format before publishing. 
false, do not encoding msg before publishing.

tag: the TAG of message.

attrs: attribures of message.

If message contains Chinese characters, must set `b64` to `true`.
Only very simple message can set `b64` to `false`.

# Subscription(name:string, topic:Topic)
Operate a subscription.
```javascript
var AliMNS = require("ali-mns");
var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
var topic = new AliMNS.Topic("t11", account, "shenzhen");
var subscription = new AliMNS.Subscription("s12", topic);
```

## subscription.getName()
Get name of subscription.

## subscription.getTopic()
Get topic of subscription.


## subscription.getAttrsP() & subscription.setAttrsP(options:any)
Get or set attributes of subscription.

options: attributes of subscription.

options.NotifyStrategy: BACKOFF_RETRY or EXPONENTIAL_DECAY_RETRY.
```javascript
subscription.setAttrsP({ NotifyStrategy: AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY });
```

## Subscription.NotifyStrategy
Contains 2 const string.

AliMNS.Subscription.NotifyStrategy.BACKOFF_RETRY : "BACKOFF_RETRY"

AliMNS.Subscription.NotifyStrategy.EXPONENTIAL_DECAY_RETRY : "EXPONENTIAL_DECAY_RETRY"

[More about NotifyStrategy[zh-Hans]](https://help.aliyun.com/document_detail/mns/api_reference/concepts/NotifyStrategy.html?spm=5176.docmns/api_reference/topic_api_spec/subscription_operation.6.141.tmwb5L)

## Subscription.NotifyContentFormat
Contains 2 const string.

AliMNS.Subscription.NotifyContentFormat.XML : "XML"

AliMNS.Subscription.NotifyContentFormat.SIMPLIFIED : "SIMPLIFIED"

[More about NotifyContentFormat[zh-Hans]](https://help.aliyun.com/document_detail/mns/api_reference/concepts/NotifyContentFormat.html?spm=5176.docmns/api_reference/concepts/NotifyStrategy.6.142.kWiFyy)

# DEBUG Trace
Set the environment variable **DEBUG** to "ali-mns" to enable the debug trace output.
```SHELL
# linux bash
export DEBUG=ali-mns

# windows
set DEBUG=ali-mns
```

# Migrate
+ 1.The ali-mns is fully compatible with ali-mqs, simply replace the ali-mqs package to ali-mns.
```javascript
// var AliMQS = require('ali-mqs');
var AliMQS = require('ali-mns');
```

+ 2.Optional. Change the **ownerId** to **accountId**
Ali-Yun upgrade their account system, and recommend to use the newer account id instead of owner id.
But the old owner id is still available for now.
```javascript
var AliMQS = require("ali-mns");
// var account = new AliMNS.Account("hl35yqoedp", "<your-key-id>", "<your-key-secret>");
var account = new AliMNS.Account("1786090012649663", "<your-key-id>", "<your-key-secret>");
```
**ownerId** is mixed with number and letter

**accountId** is a 16-digits number,
follow [this link](https://account.console.aliyun.com/#/secure) to find your accountId.

In GitHub, [An branch v1.x](https://github.com/InCar/ali-mns/tree/v1.x) keeps tracking for the old mqs services.
And use `npm install ali-mqs' to install the [ali-mqs](https://www.npmjs.com/package/ali-mqs) package for v1.x.

# Performance - Serial vs. Batch
Create 20 queues, then send 2000 messages to them randomly.

It is about **10 times slower** in serial mode than in batch mode.  

**1st - Serial Mode(batch_size=1)**
```
// 20 queues 2000 messages batch_size=1
  AliMNS-performance
    concurrent-queues
      √ #BatchSend (3547ms)
      √ #recvP (21605ms)
      √ #stopRecv (6075ms)
```

**2nd - Batch Mode(Batch_size=16)**
```
// 20 queues 2000 messages batch_size=16
  AliMNS-performance
    concurrent-queues
      √ #BatchSend (3472ms)
      √ #recvP (2125ms)
      √ #stopRecv (6044ms)
```

The testing code is in [$/test/performance.js](https://github.com/InCar/ali-mns/blob/master/test/performance.js)
and a test log sample is in [$/test/performance.log](https://github.com/InCar/ali-mns/blob/master/test/performance.log)

Use `npm run test` to execute the test.

Set environment variable **DEBUG** to **ali-mns.test** to turn on output trace(will slow down the test).

# Privacy Policy
We collect information about how you use the `ali-mns` packages for better service.

By default a tracing information is sent to google analytics when sending a request to ali-mns service,
The tracing information contains only the url.
Your data, key will not be sent.
Your account id is sent by hash to md5 value, so it can not be used tracking back to you.
You can check [code](https://github.com/InCar/ali-mns/blob/master/ts/GA.ts#L28) about data collection.

You can always disable data collection as you wish.
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    
    // Disable google analytics data collection
    account.setGA(false);
    
    var mq = new AliMNS.MQ("<your-mq-name>", account, "hangzhou");
    mq.sendP("Hello ali-mns").then(console.log, console.error);
```

# License
MIT
