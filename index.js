const util = require("util");
const io = require("socket.io-client");
const request = require('request');
const WebSocket = require('websocket');
const WebSocketClient = WebSocket.client;
const requestPromise = util.promisify(request);
require('console-stamp')(console, { 
    format: ':date(yyyy/mm/dd HH:MM:ss.l)' 
} );
var pjson = require('./package.json');

//////////////////////////////////////////////////////////////////
console.log("==============================================");
console.log("===========  START Every-Donation  ===========");
console.log(`===========   Ver ${pjson.version}/20210609   ===========`);
console.log("==============================================");
console.log("===========   Developed by NOMO    ===========");
console.log("===========   nomotg@gmail.com     ===========");
console.log("===========   https://nomo.asia    ===========");
console.log("==============================================\n");

function doSomething(cont){
    // doSomething
    console.log(cont);
}

async function main(){
    //////////////////////////////////////////////////////////////////
    /// READ settings.json file
    //////////////////////////////////////////////////////////////////
    var settings = {
        "afreehp": {
            "use": false,
            "alertbox_url": "http://afreehp.kr/page/VJWXnaiax8bYmqSVwJY"
        },
        "twip":{
            "use": true,
            "alertbox_url": "https://twip.kr/widgets/alertbox/o9me5R432A"
        },
        "toonat": {
            "use": false,
            "alertbox_url": "https://toon.at/widget/alertbox/2e08ca0363a948487b31f5ae18be46be"
        }
    }

    //////////////////////////////////////////////////////////////////
    /// afreehp
    //////////////////////////////////////////////////////////////////
    if(settings.afreehp.use){
        console.log("==============================================");
        console.log("Initialize afreehp");
        try{
            var response = await requestPromise(settings.afreehp.alertbox_url);
            if(response.statusCode == 200){
                var matched_res = response.body.match(/idx:\s*"([a-zA-Z0-9]+)",/);
                if(matched_res !== null && matched_res.length > 1){
                    settings.afreehp.idx = matched_res[1];
                    console.log(`Get afreehp.idx succeed : ${settings.afreehp.idx}\n`);
                }
                else{
                    console.error("Get afreehp.idx parse failed.\n");
                }
            }
            else{
                console.error("Get afreehp.idx failed.\n");
            } 
        }
        catch(e){
            console.error("Error afreehp.idx parse: " + e.toString());
        }
        
        function connect_afreehp(){
            if(settings.afreehp.idx === undefined){
                console.log("can not find afreehp idx");
                return;
            }

            const url_ws_afreehp = "http://afreehp.kr:13536";
            const socketAfreehp = io(url_ws_afreehp,{
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 10000,
                autoConnect: false
            });
            
            var page = {
                idx: settings.afreehp.idx//,
                // pagelist: [{pageid: "alert", subpage: "0"}],
                // platform: {twitch: "twitch_channel_id", youtube: "youtube_channel_unique_code"}
            };
            
            socketAfreehp.on("connect", function(){
                console.log("Afreehp Connected");
                socketAfreehp.emit("page", page);
                // socket.send("pagecmd", pagecmd);
            });
            
            socketAfreehp.on("cmd", function(data){
                try{
                    // console.log(data);
                    if(data.data !== undefined && data.data.value !== undefined && data.data.type !== undefined){
                        var val = data.data.value;
                        var type = data.data.type;
                        var id = data.data.id;
                        var name = data.data.name;
                        switch(data.data.broad){
                            case "twitch":
                                if(type == "cheer"){
                                    console.log(`Afreehp message received! ${val} ${type} from ${name}(${id})`);
                                    doSomething(data);
                                }
                                break;
                            case "afreeca":
                                if(type == "star"){
                                    console.log(`Afreehp - starballoon : ${val} from ${name}(${id})`);
                                    doSomething(data);
                                }
                                else if(type == "adballoon"){
                                    console.log(`Afreehp - adballoon : ${val} from ${name}(${id})`);
                                    doSomething(data);
                                }
                            case "youtube":
                                if(type == "superchat"){
                                    console.log(`Afreehp - superchat : ${val} from ${name}(${id})`);
                                    doSomething(data);
                                }
                            default:
                                break;
                        }
                    }
                }
                catch(e){
                    console.error("Afreehp message parse error: ", e.toString());
                }
                
            });
            
            socketAfreehp.on("error", function(){
                console.error("Afreehp error");
            });
            
            socketAfreehp.on("close", function(){
                console.log("Afreehp close");
            });
            socketAfreehp.on("connect_error", function(err){
                console.error("Afreehp connect_error");
                console.error(err);
            });

            setTimeout(function(){
                socketAfreehp.connect();
            },1000);
        }

        connect_afreehp();
    }

    //////////////////////////////////////////////////////////////////
    /// twip
    //////////////////////////////////////////////////////////////////
    if(settings.twip.use){
        
        console.log("==============================================");
        console.log("Initialize Twip");
        try{
            var response = await requestPromise(settings.twip.alertbox_url);
            if(response.statusCode == 200){
                var matched_res;
                // token
                matched_res = response.body.match(/window\.__TOKEN__ = \'(.+)\';<\/script>/);
                if(matched_res !== null && matched_res.length > 1){
                    settings.twip.token = matched_res[1];
                    console.log(`Get Twip token succeed : ${settings.twip.token}`);
                }
                else{
                    console.error("Get Twip token parse failed.");
                }

                // version
                matched_res = response.body.match(/version: \'(.+)\',/);
                if(matched_res !== null && matched_res.length > 1){
                    settings.twip.version = matched_res[1];
                    console.log(`Get Twip version succeed : ${settings.twip.version}\n`);
                }
                else{
                    console.error("Get Twip version parse failed.\n");
                }
            }
            else{
                console.error("Get Twip token and version failed.");
            }
        }
        catch(e){
            console.error("Error get Twip token, version: " + e.toString());
        }

        function connect_twip(){
            if(settings.twip.token === undefined){
                console.log("can not find twip token");
                return;
            }
            if(settings.twip.version === undefined){
                console.log("can not find version token");
                return;
            }

            const url_ws_twip = `https://io.mytwip.net?alertbox_key=${settings.twip.alertbox_url.split("/").pop()}&version=${settings.twip.version}&token=${encodeURIComponent(settings.twip.token)}`;
            const socketTwip = io(url_ws_twip,{
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionDelay: 10000,
                autoConnect: false
            });
            
            socketTwip.on("connect", function(){
                console.log("Twip Connected");
            });
            
            // new donate
            socketTwip.on("new donate", function(message){
                doSomething(message);
            });

            // new cheer
            socketTwip.on("new cheer", function(message){
                doSomething(message);
            });

            // new follow
            socketTwip.on("new follow", function(message){
                doSomething(message);
            });

            // new sub
            socketTwip.on("new sub", function(message){
                doSomething(message);
            });

            // new hosting
            socketTwip.on("new hosting", function(message){
                doSomething(message);
            });

            // new redemption
            socketTwip.on("new redemption", function(message){
                doSomething(message);
            });

            socketTwip.on("not allowed ip", function(){
                console.error("twip not allowed ip");
            });
            
            socketTwip.on("version not match", function(){
                console.log("twip version not match");
            });

            socketTwip.on("disconnect", function(){
                console.log("twip disconnect");
            });

            // other event type
            // pause, skip, reload, media:setvolume, media:show, exclude, ...
            
            setTimeout(function(){
                socketTwip.connect();
            },1000);
        }

        connect_twip();
    }


    //////////////////////////////////////////////////////////////////
    /// toonat
    //////////////////////////////////////////////////////////////////
    if(settings.toonat.use){
        console.log("==============================================");
        console.log("Initialize toonat");
        try{
            var response = await requestPromise(settings.toonat.alertbox_url);
            if(response.statusCode == 200){
                var matched_res = response.body.match(/"payload"\s*:\s*"([a-zA-Z0-9]+)"/);
                if(matched_res !== null && matched_res.length > 1){
                    settings.toonat.payload = matched_res[1];
                    console.log(`Get toonat.payload succeed : ${settings.toonat.payload}\n`);
                }
                else{
                    console.error("Get toonat.payload failed.\n");
                }
            }
            else{
                console.error("Get toonat.payload failed.");
            }
        }
        catch(e){
            console.error("Error toonat.payload parse: " + e.toString());
        }
        
        var toonAtClient = null ;
        function connect_toonat(){
            if(settings.toonat.payload == undefined){
                console.log("can not found toonay payload");
                return;
            }

            toonAtClient = null;
            toonAtClient = new WebSocketClient();
            
            toonAtClient.on('connectFailed', function(error) {
                console.log('Toonat Connect Error: ' + error.toString());
            });
            
            toonAtClient.on('connect', function(connection) {
                console.log('Toonat Connected');
        
                setInterval(function(){
                    connection.ping("#ping");
                }, 12000);
        
                connection.on('error', function(error) {
                    console.error("Toonat Connection Error: " + error.toString());
                });
                connection.on('close', function() {
                    console.error('Toonat Connection Closed. Try to reconnect after 10 seconds...');
                    setTimeout(function(){
                        connect_toonat();
                    },10000);
                });
                connection.on('message', function(message) {
                    // console.log(message);
                    try{
                        if (message.type === 'utf8') {
                            var data = JSON.parse(message.utf8Data);
                            if(data.content !== undefined && data.code !== undefined && data.code == 101){  // 101: donation, 107: bit, ...
                                doSomething(data);
                            }
                        }
                    }
                    catch(e){
                        console.error("Error from Toonat message: " + e.toString());
                    }
                });
            });
            
            toonAtClient.connect("wss://toon.at:8071/"+settings.toonat.payload);
        }

        
        setTimeout(function(){
            connect_toonat();
        },1000);
    }
}

try{
    main();
}
catch(e){
    console.error("Error from main function: " + e.toString());
}