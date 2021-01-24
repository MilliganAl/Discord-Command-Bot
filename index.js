// Load up the discord.js library
const Discord = require("discord.js");

/*
 DISCORD.JS VERSION 12 CODE
*/



const client = new Discord.Client();
const config = require("./config.json");

const token = "*";

function createConnection(){

  var mysql = require('mysql');

  //need to move this to a more secure place
  return mysql.createConnection({
    host: "localhost",
    port:3306,
    user: "root",
    password: "password",
    database : 'database'
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
    message.channel.send(sayMessage);
  }
  

  if(command === 'bookme') {
    
    var con = createConnection();
    
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
      
      var advice = response.data.lyrics;

        if (advice.length > 2000){

        var lyrics = advice.slice(0, 2000) + " @ " + advice.slice(2000);

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

    var con = createConnection();
    
    con.query('SELECT Player_Name,Score,LastUpdatedDate FROM Scoreboard', function (err, recordset) {
    
      var thisthat = recordset;
    

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
  if(command === 'translate'){

    var message = args.join(' ');
    const translate = require('translate');

    const translatedText = await translate(message, 'es');

    message.channel.send(translatedText);
  
  }

});

