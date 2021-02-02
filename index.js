//TODO
//move sql connection function to its own file
//move token to conifg.JSON 
//Create more messaging funtions
//Make SQL use stored proceudres 
//git rid of all these if statments and find a better way to navigate


//import rankApis from './rocket-league-apis-client-master/src/index.js'
//https://www.npmjs.com/package/@xboxreplay/xboxlive-api
//https://discord.com/developers/docs/


/*
 DISCORD.JS VERSION 12 CODE
*/
// Load up the discord.js library
const Discord = require("discord.js");
const { data } = require("jquery");
const liveAuth = require('@xboxreplay/xboxlive-auth');
const xlive = require('@xboxreplay/xboxlive-api');
const formatting = require('./format-messaging')

const client = new Discord.Client();
const config = require("./config.json");

const token = "token";

function createConnection(args){

  var mysql = require('mysql');
  var database = 'databasePROD';
  if (args === 'book'){
    database ='databaseDEV'
  }

  //need to move this to a more secure place
  return mysql.createConnection({
    host: "localhost",
    port:3306,
    user: "root",
    password: "somepassword",
    database : database
  });
};

client.login(token);


client.on("ready", () => {
  
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);

  client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});


client.on("message", async message => {
  
  if(message.author.bot) return;
  if(!message.content.startsWith(config.prefix)) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  
  if(command === "ping") {
    
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);

  }
  
  if(command === "say") {
 
    const sayMessage = args.join(" ");

    message.delete().catch(O_o=>{}); 
    message.
    message.channel.send(sayMessage);
  }
  

  if(command === 'bookme') {
    
    var con = createConnection('book');
    
    con.query('SELECT pdf FROM book ORDER BY RAND()  LIMIT 1', function (err, recordset) {
        
    if (err) console.log(err)

    message.channel.send(recordset[0].pdf);

  });
    
  }

  if(command === 'advice') {
   
    const axios = require('axios');

    axios.get('https://api.adviceslip.com/advice')
      .then(response => {
        var advice = response.data.slip.advice;

        message.channel.send(advice);
      })
      .catch(error => {
        console.log(error);
      });  
          
  }

  if(command === 'song') {

    const userRequest = args.join(" ");
    const songAndArtist = userRequest.split(" ");

    const axios = require('axios');

    axios.get('https://api.lyrics.ovh/v1/'+ songAndArtist[0] + '/' + songAndArtist[1])
    .then(response => {
      
      var songLyrics = response.data.lyrics;

        if (songLyrics.length > 2000){

        var lyrics = songLyrics.slice(0, 2000) + " @ " + songLyrics.slice(2000);

        var lyricsSplit = lyrics.split(' @ ');

        
        for ( var i = 0 ; i < lyricsSplit.length; i++){
          message.channel.send(lyricsSplit[i]);
        }


        }

    })
    .catch(error => {
      console.log(error);
    });  
        
  }


  if(command === 'scoreboard') {

    var writeSQL = createConnection();
    
    writeSQL.query('SELECT Player_Name,Score,LastUpdatedDate FROM Scoreboard', function (err, recordset) {
    
      
      var scores = [];

      for(var i = 0; i < recordset.length; i++){
          scores.push(recordset[i].Player_Name + ": " + recordset[i].Score + "\n")
      }

        var currentScores = "Current Scores :fire::100::fire::100::fire::100::fire::100::fire::100::fire::100:  \n";

        for(var i = 0; i < scores.length; i++){
        currentScores = currentScores + scores[i]
        }

        message.channel.send(currentScores);

  });

  }

  if(command === 'addscore') {
    var con = createConnection();
    var winner = args.join(" ")

    con.query(
      'UPDATE Scoreboard SET Score = Score + 1 WHERE LOWER(Player_Name) = ?',[ winner ], 
      function (err, results) {
      }
  );
    con.query('SELECT Player_Name,Score,LastUpdatedDate FROM Scoreboard' , function (err, recordset) {
  
      var scores = [];

      for(var i = 0; i < recordset.length; i++){
          scores.push(recordset[i].Player_Name + ": " + recordset[i].Score + "\n")
      }

        var currentScores = "Current Scores :fire::100::fire::100::fire::100::fire::100::fire::100::fire::100:  \n";

        for(var i = 0; i < scores.length; i++){
        currentScores = currentScores + scores[i]
        }

        message.channel.send(currentScores);
  
  });
  
  }
  if(command === 'clearscores') {

    var con = createConnection();
      
    const winner = args.join(" ");

    con.query('UPDATE Scoreboard SET Score = 0 WHERE Score > ? ',[ 0 ]);

    con.query('SELECT Player_Name,Score,LastUpdatedDate FROM Scoreboard' , function (err, recordset) {
  
      var scores = [];

      for(var i = 0; i < recordset.length; i++){
          scores.push(recordset[i].Player_Name + ": " + recordset[i].Score + "\n")
      }
        var currentScores = "Current Scores :fire::100::fire::100::fire::100::fire::100::fire::100::fire::100:  \n";

        for(var i = 0; i < scores.length; i++){
        currentScores = currentScores + scores[i]
        }

        message.channel.send(currentScores);
  
  });
  
  }
  if(command === 'recent'){

   var player = args.join(' ');

 
   var auth = await liveAuth.authenticate('some-email@live.com', 'somePassword');
    
    var data = await xlive.getPlayerGameClips(player, {
      userHash: auth.userHash,
      XSTSToken:auth.XSTSToken

    }, ['gameClipUris', 'titleName', 'datePublished', 'dateRecorded']);
  
   var formattedMessage =  formatting.SendEmbededMessage(data.gameClips[0].dateRecorded,
                                                                                                     data.gameClips[0].gameClipUris[0].uri,
                                                                                                     client.user.avatarURL(),
                                                                                                     client.user.username);
  message.channel.send(formattedMessage); 
 
  }
  if(command === 'trumpme') {
    
   
    const axios = require('axios');

    axios.get('https://api.whatdoestrumpthink.com/api/v1/quotes/random')
      .then(response => {
        var advice = response.data.message;

        message.channel.send(advice);
      })
      .catch(error => {
        console.log(error);
      });  
          
  }

});

