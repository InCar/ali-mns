// test

var Path = require("path");
var AliMQS = require(Path.join(__dirname, "../index.js"));


function runTest(){
    var account = new AliMQS.Account("your-owner-id", "your-key-id", "your-key-secret");
    var mqs = new AliMQS.MQS(account, "hangzhou");

    return mqs.listP();
}

runTest().done(function(ret){
    console.log("okay");
    console.log(ret);
}, function(ex){
    console.log("failed");
    console.log(ex);
});