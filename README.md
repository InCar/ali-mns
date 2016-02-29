# ali-mns (ali-mqs)
[![npm version](https://badge.fury.io/js/ali-mns.svg)](http://badge.fury.io/js/ali-mns)
[![npm version](https://badge.fury.io/js/ali-mqs.svg)](http://badge.fury.io/js/ali-mqs)

The nodejs sdk for aliyun mns service

阿里云消息服务(MNS)nodejs软开发包

Ali MNS service is a MQ(message queue) service provided by AliYun.
The world largest online sales website www.taobao.com is heavily relying on it.

阿里云消息服务是由阿里云提供的一种消息队列服务中间件.
淘宝网www.taobao.com本身也使用了这种技术.

You can visit [http://www.aliyun.com/product/mns](http://www.aliyun.com/product/mns) for more details.

访问阿里云消息服务的官方网站 [http://www.aliyun.com/product/mns](http://www.aliyun.com/product/mns) 以了解更多有关阿里云消息服务的详情.

The original Ali-MQS service has been upgraded and changed it's name to Ali-MNS since June, 2015.
Go to  [Migrate](#migrate) part for the old version informations.

2015年6月,阿里云使用了新名称Ali-MSN替代了旧的Ali-MQS.
了解如何从旧的版本升级,请访问 [Migrate](#migrate).

# QuickStart 快速开始
Use 'npm install ali-mns' to install the package.

使用'npm install ali-mns'来进行安装.

```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMNS.MQ("<your-mq-name>", account, "hangzhou");
    // send message
    mq.sendP("Hello ali-mns").then(console.log, console.error);
```

# Promised
The ali-mns use the [promise](https://www.npmjs.org/package/promise) pattern.
Any functions suffix with 'P' indicate a promise object will be returned from it.

ali-mns使用 [promise](https://www.npmjs.org/package/promise) 模式.
所有后缀'P'的方法都会返回一个promise对象.

# Typescript
If you only want to use it, forget this.

如果仅仅只是打算使用它,放心忽略本小节内容.

Most source files are written in typescript instead of javascript.
Visit [http://www.typescriptlang.org/](http://www.typescriptlang.org/) for more information about typescript.

绝大多数源代码都用typescript写成,访问 [http://www.typescriptlang.org/](http://www.typescriptlang.org/) 获取更多typescript的知识.

If you interest in source file, visit GitHub [https://github.com/InCar/ali-mns](https://github.com/InCar/ali-mns)

如果你对源代码感兴趣,访问GitHub [https://github.com/InCar/ali-mns](https://github.com/InCar/ali-mns)

Please use 'grunt' to compile ts files into a single index.js file after downloading source files. 

克隆源代后,使用`grunt`来编译.ts文件.

# API Reference 参考
## Account(accountId:string, keyId:string, keySecret:string)
The *Account* class store your ali account information. Construct an account object is simple:

*Account*类用于存储你的阿里云帐号信息.创建一个帐号对象很简单:

accountId: String, ali account id. 阿里云帐号id.

keyId: String, ali key id. 阿里云钥id.

keySecret: String, ali key secret. 阿里云密钥.
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
```
The account object is usually passed as an argument for other class such as *MNS*, *MQ*

帐号对象通常作为参数被传递给其它类的对象如*MNS*, *MQ*

Follow [this link](https://ak-console.aliyun.com/#/accesskey) to find yours.

猛戳[这里](https://ak-console.aliyun.com/#/accesskey)找到你的阿里云帐号.

## account.getAccountId()
Return the ali account id.

返回阿里云帐号id.

## account.getOwnerId()
Same as account.getAccountId(). For compatible v1.x.

和account.getAccountId()功能相同. 为了向下兼容v1.x版本.

## account.getKeyId()
Return the ali key id.

返回阿里钥id.

## MNS(account:Account, region?:string)
The *MNS* operate the mns queue.

*MNS*类用于操作mns队列.

account: An account object. 阿里云帐号对象.

region: String, optional. It can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mns service.
Default is "hangzhou". It can also be internal address "hangzhou-internal", "beijing-internal" or "qingdao-internal".
可能的取值为"hangzhou", "beijing" or "qingdao",分别代表阿里云提供消息服务的3个数据中心.
缺省为"hangzhou".也可以是带有"-internal"后缀的内网形式,如"hangzhou-internal", "beijing-internal" or "qingdao-internal".
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-account-id>", "<your-key-id>", "<your-key-secret>");
    var mns = new AliMNS.MNS(account, "hangzhou");
```

## MQS(account:Account, region?:string)
Same as MNS. For compatible v1.x.

和MNS相同.为了向下兼容v1.x版本.

## mns.listP(prefix?:string, pageSize?:number, pageMarker?:string)
List all of the queue in a data center.

列出一个数据中心里的所有队列.

prefix: String, optional. Return only mq with the prefix. 只返回带有此前缀的队列.

pageSize: number, optional. How many mns will be returned in a page, 1~1000, default is 1000. 每页返回多少队列,1~1000,缺省1000.

pageMarker: String, optional. Request the next page, the value is returned in last call. 填入上一次请求中返回的值,来请求下一页.
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

创建一个队列.

name: String. The queue name. 队列名称.

options: optional. The queue attributes. 队列属性.

options.DelaySeconds: number. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0. 消息被发送后经过多少秒才可见.0~604800(7天),缺省0.

options.MaximumMessageSize: number. How many bytes could the message be. 1024(1k)~65536, default is 65536(64k). 消息最大可以是多少字节.1024(1k)~65536, 缺省是65536(64k).

options.MessageRetentionPeriod: number. How many seconds will the messages live, 60~1296000(15days), default is 345600(4days). 消息最久可以生存多少秒, 60~129600(15天),缺省是345600(4天).

optiions.VisibilityTimeout: number. How many seconds will the message keep invisible after be received, 1~43200(12hours), default is 30. 消息被接收后,保持多少秒不可见,1~43200(12小时).

options.PollingWaitSeconds: numer. How many seconds will the receive request wait for if mq is empty. 0~30, default is 0. 当消息队列为空时,接收请求最多等待多少秒,0~30,缺省是0.
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

如果一个同名队列已经存在,且调用createP方法的所有属性都和现有队列相同,那么调用会返回成功.
任何一个属性不同,会报告"QueueAlreadyExist"(队列已经存在)错误.

## mns.deleteP(name:string)
Delete an mq.

删除一个队列.

name: String. The queue name.队列名称.
```javascript
    mns.deleteP("myAliMQ").then(console.log, console.error);;
```

## MQ(name:string, account:Account, region?:string)
The *MQ* operate the message in a queue.

*MQ*操作队列中的消息.

name: String. The name of mq.队列名称.

account: An account object.帐号对象.

region: String, optional. It can be "hangzhou", "beijing" or "qingdao", the 3 data center that provide mns service.
Default is "hangzhou". It can also be internal address "hangzhou-internal", "beijing-internal" or "qingdao-internal".
可能的取值为"hangzhou", "beijing" or "qingdao",分别代表阿里云提供消息服务的3个数据中心.
缺省为"hangzhou".也可以是带有"-internal"后缀的内网形式,如"hangzhou-internal", "beijing-internal" or "qingdao-internal".
```javascript
    var AliMNS = require("ali-mns");
    var account = new AliMNS.Account("<your-owner-id>", "<your-key-id>", "<your-key-secret>");
    var mq = new AliMNS.MQ("myAliMQ", account, "hangzhou");
```

## mq.getName()
Gets the name of mq.

获取队列名称.

## mq.getAccount()
Gets the account of mq.

获取队列帐号.

## gmq.etRegion()
Gets the region of mq.

获取队列位置.

## mq.sendP(msg:string, priority?:number, delaySeconds?:number)
Send a message to the queue.

向队列中发送一个消息.

message: String. The content that sent to queue. 消息内容.

priority: number, optional. 1(lowest)~16(highest), default is 8. 优先级1(最低)~16(最高),缺省是8.

delaySeconds: number, optional. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.
消息发送多少秒后才可见,0~604800(7天),缺省是0.此参数优先于队列的options.DelaySeconds属性.
```javascript
    mq.sendP("Hello Ali-MNS", 8, 0).then(console.log, console.error);
```

## mq.getRecvTolerance() & mq.setRecvTolerance(value:number)
Gets or sets the tolerance seconds for mq.recvP method.

获取或设置mq.recvP方法的容忍秒数.

value: number. Default is 5, in seconds. How long will mq.recvP wait before timeout.
Due to network lag, the return of mq.recvP method may be later than expected.
缺省是5秒.多久mq.recvP方法会触发超时.
由于网络延迟,mq.recvP方法返回可能会更晚.

## mq.recvP(waitSeconds?:number)
Receive a message from queue.
This will change the message to invisible for a while.

从队列中接收消息.
它会短暂改变消息的可见性.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.
在返回*MessageNotExist*(消息不存在)错误之前,最大的等待秒数.
```javascript
    mq.recvP(5).then(console.log, console.error);
```
This method will wait `waitSeconds + getRecvTolerance()` totally if queue is empty.
如果队列为空,那么此方法一共会等待`waitSeconds + getRecvTolerance()`秒.

## mq.peekP()
Peek a message.
This will not change the message to invisible.

查探消息.
它不会改变消息的可见性.
```javascript
    mq.peekP(5).then(console.log, console.error);
```

## mq.deleteP(receiptHandle:string)
Delete a message from queue.
A message will be invisible for a short time after received.
A message must be deleted after processed, otherwise it can be received again.

删除消息.
消息被接收后,有一个短暂的不可见期.消息在被处理完成后,必须被删除,否则,当不可见期过后,它又能再次被接收.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv.由mq.recvP或mq.notifyRecv返回.
```javascript
    mq.recvP(5).then(function(data){
        return mq.deleteP(data.Message.ReceiptHandle);
    }).then(console.log, console.error);
```

## mq.reserveP(receiptHandle:string, reserveSeconds:number)
Reserve a received message.

保留一个消息.

receiptHandle: String. Return by mq.recvP or mq.notifyRecv. 由mq.recvP或mq.notifyRecv返回.

reserveSeconds: number. How long will the message be reserved, in seconds. 1~43200(12hours).
消息保留多少秒,1~43200(12小时).
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

如果处理消息需要花费更多的时间,可以使用这个方法把消息保留更久一些.
从调用此方法开始,消息将继续保持不可见reserveSeconds秒.
也可以设置一个比它的原本不可见期更短的时间.
如果成功,返回一个新的receiptHandle用来取代旧的那个,后续对mq.deleteP或mq.reserveP的调用必须使用这个新的值.
并且,这个新的receiptHandle将会在reserveSeconds秒后过作废.

## mq.notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number)
Register a callback function to receive messages.

注册一个回调函数来接收消息.

cb: The callback function will be called once for each received message.
And if the callback function return *true*, the message received will be delete automatically,
while you should delete the message manually, if return *false*.
每收到一条消息,注册的回调函数就会被调用一次.
如果回调函数返回*true*,收到的消息会被自动删除.
如果你想自己执行删除操作,那么让回调函数返回*false*.

waitSeconds: number, optional. 1~30. The max seconds to wait in a polling loop, default is 5.
At the begin of a polling loop, it will check if mq.notifyStopP has been called, So the bigger number
will cause a slowly mq.notifyStopP.
Set waitSeconds to 0 ,will actually use the default value 5 seconds instead.
可能的值为1~30.每次轮循最大等待秒数,缺省是5.
在每次轮循的开始,都会检查mq.notifyStopP是否已被调用,所以更大的数值会导致更慢的mq.notifyStopP
设置为0时,会和设置为缺省值5秒的效果相同.
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

如果对同一个队列设置2个不同的回调函数,那么2个回调函数都会起作用.
但一个消息的到来,只会触发它们之中的一个.

## mq.notifyStopP()
Stop mq.notifyRecv working. The promise object returned will not be resolved until the receiving loop stopped actually.
The max time wait for notifyRecv() stop is determined by waitSeconds passed to mq.notifyRecv.

停止mq.notifyRecv.接收循环实际停止时,返回的promise对象才会被解析.
notifyRecv()的最大等待时长由传递给mq.notifyRecv的waitSeconds参数决定.
```javascript
    mq.notifyStopP().then(console.log, console.error);
```

## mq.getAttrsP()
Get the attributes of the mq.

获取队列的属性.
```javascript
mq.getAttrsP().then(console.log, console.error);
```

## mq.setAttrsP(options:any)
Modify the attributes of mq.

修改队列的属性.

options: the queue attributes. See the [options](#options) of mns.createP. 队列属性,查看mns.createP的[options](#options)参数.
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

简单消息定义,用于MQBatch类.

msg: string. The content of message.消息内容.

priority: number, optional. 1(lowest)~16(highest), default is 8.消息优先级.1(最低)~16(最高).

delaySeconds: number, optional. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.
消息发送多少秒后才可见,0~604800(7天),缺省是0.此参数优先于队列的options.DelaySeconds属性.
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

2015年6月,阿里云引入了新的批量消息队列模式.此类派生自MQ类,因此,所有MQ类的方法对MQBatch都适用.例如,你
可以使用`mqBatch.setRecvTolerance(1.2)`来调节*mqBatch.recvP()*的超时行为.
```javascript
var mqBatch = new AliMNS.MQBatch(aliCfg.mqName, account, aliCfg.region);
```

## mqBatch.sendP(msg:string | Array<Msg>, priority?:number, delaySeconds?:number)
Send a message or batch send messages to the queue.

发送一条消息或一批消息.

msg: String or an array of Msg. The message(s) up to 16 that sent to queue. 字符串或者Msg对象的数组.一批最大可以发送16个消息.

priority: number, optional. Only valid when `msg` is a string, 1(lowest)~16(highest), default is 8. 优先级,仅在`msg`参数是字符串时有效,1(最低)~16(最高).缺省是8.

delaySeconds: number, optional. Only valid when `msg` is a string. How many seconds will the messages be visible after sent. 0~604800(7days), default is 0.
This argument is prior to the options.DelaySeconds in attributes of message queue.
仅在`msg`参数是字符串时有效,消息发送多少秒后才可见,0~604800(7天),缺省是0.此参数优先于队列的options.DelaySeconds属性.

If `msg` is an array of `Msg`, use the priority & delaySeconds properties of `Msg`, and ignore the 2nd and 3rd arguments.
如果`msg`是`Msg`的数组,使用`Msg`对象的priority和delaySeconds属性,并忽略第2和第3个参数.
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

接收一条或者一批消息.
它会改变消息的可见性.

waitSeconds: number. optional.
The max seconds to wait if queue is empty, after that an error *MessageNotExist* will be returned.
在返回*MessageNotExist*(消息不存在)错误之前,最大的等待秒数.

numOfMessages: number. optional. The max number of message can be received in a batch, can be 1~16, default is 16.
最多一批接收的消息数目,1~16,缺省是16.
```javascript
    mqBatch.recvP(5, 16).then(console.log, console.error);
```

## mqBatch.peekP(numOfMessages?:number)
Peek message(s).
This will not change the message to invisible.

查探一条或者一批消息.
它不会改变消息的可见性.

numOfMessages: number. optional. The max number of message can be peeked in a batch, can be 1~16, default is 16.
最多一批查探的消息数目,1~16,缺省是16.
```javascript
    mqBatch.peekP(5, 16).then(console.log, console.error);
```

## mqBatch.deleteP(receiptHandle:string | Array<string>)
Delete a message or messages from queue.
Messages will be invisible for a short time after received.
Messages must be deleted after processed, otherwise it can be received again.

删除一条或一批消息.
消息被接收后,有一个短暂的不可见期.消息在被处理完成后,必须被删除,否则,当不可见期过后,它又能再次被接收.

receiptHandle: String or an array of string. Return by mq.recvP mq.notifyRecv or mqBatch.recvP mqBatch.notifyRecv.
字符串或字符串数组,由mq.recvP或mq.notifyRecv返回.

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

注册一个回调函数来接收消息,支持批量模式.

numOfMessages: number. optional. The max number of message can be received in a batch, can be 1~16, default is 16.
最多一批接收的消息数目,1~16,缺省是16.

All other arguments are same as *mq.notifyRecv*.

所有春它参数都和*mq.notifyRecv*一致.

# DEBUG Trace
Set the environment variable **DEBUG** to "ali-mns" to enable the debug trace output.

设置环境变量"ali-mns"为**DEBUG**可以开启调试输出.
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

# Performance - Serial vs. Batch 串行和批量的性能对比
Create 20 queues, then send 2000 messages to them randomly.

创建20个队列,然后随机的向它们发送共计2000条消息.

It is about **10 times slower** in serial mode than in batch mode.  

串行模式大约比批量模式慢10倍.

**1st - Serial Mode(batch_size=1)**
```
// 20 queues 2000 messages batch_size=1 串行模式
  AliMNS-performance
    concurrent-queues
      √ #BatchSend (3547ms)
      √ #recvP (21605ms)
      √ #stopRecv (6075ms)
```

**2nd - Batch Mode(Batch_size=16)**
```
// 20 queues 2000 messages batch_size=16 批量模式(1批16条消息)
  AliMNS-performance
    concurrent-queues
      √ #BatchSend (3472ms)
      √ #recvP (2125ms)
      √ #stopRecv (6044ms)
```

The testing code is in [$/test/performance.js](https://github.com/InCar/ali-mns/blob/master/test/performance.js)
and a test log sample is in [$/test/performance.log](https://github.com/InCar/ali-mns/blob/master/test/performance.log)

Needs [mocha](https://www.npmjs.com/package/mocha) module to run the test.

Set environment variable **DEBUG** to **ali-mns.test** to turn on output trace(will slow down the test).

# License
MIT
