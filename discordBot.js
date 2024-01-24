require('dotenv').config();

// Discord.js versions ^13.0 require us to explicitly define client intents
const { Client, Intents } = require('discord.js');
const fetch = require("node-fetch");
const cheerio = require('cheerio');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const challenges = require('./challenges.json'); 
const fs = require('fs');
// client.on('ready', () => {
//  console.log(`Logged in as ${client.user.tag}!`);
// });

async function getQuote() {
  // return fetch("https://dummyjson.com/quotes/random")
  //   .then(res => {
  //     return res.json()
  //     })
  //   .then(data => {
  //     return data;
  //   })
const retrivedData = await fetch("https://dummyjson.com/quotes/random");
return retrivedData.json();
}

function getRandomChallenge() {
  const randomIndex = Math.floor(Math.random() * challenges.challenges.length);
  return challenges.challenges[randomIndex];
}

async function getChallengeTitle(url) {
  // Check if the URL is valid and retrieve the challenge title
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $('title').text().trim();
  return title;
}
function updateChallengesFile() {
  fs.writeFileSync('./challenges.json', JSON.stringify(challenges, null, 2));
}
client.on("messageCreate", async(msg) => {
  const content = msg.content.trim().toLowerCase();
  const args = content.split(' ');
  if (msg.author.bot) return
    if (msg.content  === 'hello') {
       msg.reply(`Hello ${msg.author.username}`);
     }
   else if (msg.content === "!quote") {
    const quoteData = await getQuote();
    msg.channel.send(quoteData.quote);
    
  }
     else if (msg.content === '!challenge') {
      // Respond with a random challenge
      const randomChallenge = getRandomChallenge();
      msg.reply(`${randomChallenge.name}: ${randomChallenge.url}`);
  }
  else if (msg.content === '!list') {
   const challengeList = challenges.challenges.map((item, index) => `${item.name}: ${item.url}`).join('\n');
  // console.log("challengeList",challengeList);
   msg.reply(`${challengeList}`);
}
  else if (args[0] === '!add' && args.length > 1) {
     try {
      const challengeURL = args[1];
      const challengeTitle = await getChallengeTitle(challengeURL);
      const challengeName = challengeTitle.split("|")[0];
      challenges.challenges.push({name: challengeName, url: challengeURL});
      updateChallengesFile();
      msg.reply(`Added: ${challengeName}: ${challengeURL} `);
     } catch (error) {
      msg.reply('Invalid challenge URL or unable to fetch challenge title.');
     }
}
    });
// Log In our bot
client.login(process.env.CLIENT_TOKEN);