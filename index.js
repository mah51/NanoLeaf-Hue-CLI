const {hueConnect, nanoLeafConnect} = require('./functions/connect')
const {flashNanoLeaf, flashHue} = require('./functions/flashWhite')
const chalk = require('chalk');
const path = require('path');
const discord = require('discord.js');
const Commando = require('discord.js-commando');
require('dotenv').config()
const client = new Commando.Client({
});

const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`


client.URLS = {
  nanoLeaf: nanoLeafAPI,
  hue: hueAPI
}


client.on('ready', async () => {


  console.log(`Logged in as ${client.user.tag}!`);
  const nanoLeafState = await nanoLeafConnect(nanoLeafAPI)
  const hueState = await hueConnect(hueAPI)
  console.log(chalk.magentaBright('Successfully connected to all systems'));
  await flashHue(hueAPI)
  await flashNanoLeaf(nanoLeafAPI)
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.registry
  // Registers your custom command groups
  .registerGroups([
    ['effects', 'Effect commands'],
    ['info', 'Information commands'],
    ['other', 'Some other group']
  ])

  // Registers all built-in groups, commands, and argument types
  .registerDefaults()

  // Registers all of your commands in the ./commands/ directory
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.BOT_TOKEN).catch(console.error);


