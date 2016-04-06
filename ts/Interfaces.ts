/// <reference path="Msg.ts" />

module AliMNS{
    export interface IMNS{
        // List all mns.
        listP(prefix?:string, pageSize?:number, pageMarker?:string);
        // Create a message queue
        createP(name:string, options?:any);
        // Delete a message queue
        deleteP(name:string);
    }
    
    export interface IMNSTopic extends IMNS{
        // List all topics.
        listTopicP(prefix?:string, pageSize?:number, pageMarker?:string);
        // Create a topic
        createTopicP(name:string, options?:any);
        // Delete a topic
        deleteTopicP(name:string);
    }
    
    export interface IMQ{
        // 获取MQ的属性值
        getAttrsP();
        // 设置MQ的属性值
        setAttrsP(options:any);
        // 发送消息
        sendP(msg:string, priority?:number, delaySeconds?:number);
        // 接收消息
        recvP(waitSeconds?:number);
        // 检查消息
        peekP();
        // 删除消息
        deleteP(receiptHandle:string);
        // 保留消息
        reserveP(receiptHandle:string, reserveSeconds:number);
    }
    
    export interface IMQBatch extends IMQ{
        // 发送消息
        sendP(msg:string | Array<Msg>, priority?:number, delaySeconds?:number);
        // 接收消息
        recvP(waitSeconds?:number, numOfMessages?:number);
        // 检查消息
        peekP(numOfMessages?:number);
        // 删除消息
        deleteP(receiptHandle:string | Array<string>);
    }
    
    export interface INotifyRecv{
        notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number);
        notifyStopP();
    }
    
    export interface INotifyRecvBatch extends INotifyRecv{
        notifyRecv(cb:(ex:Error, msg:any)=>Boolean, waitSeconds?:number, numOfMessages?:number);
    }
}