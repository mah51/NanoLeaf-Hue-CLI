const Commando = require("discord.js-commando");
const {getNanoLeafEffect} = require('../../functions/apiFunctions');

module.exports = class  extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'effects',
      aliases: [

      ],
      group: 'effects',
      memberName: 'effects',
      description: 'Lists all effects on NanoLeaf lights',
      details: '',
      examples: [

      ],
      args: [
        {
          key: 'brightness',
          label: 'brightness',
          prompt: 'What brightness you want?',
          type: 'integer',
          default: 75
        },
      ],
      guildOnly: false,
    });
  }

  async run(msg, args, fromPattern, result) {
    try {
      const data = await getNanoLeafEffect(this.client.URLS.nanoLeaf)
      await msg.reply(`\`${data.join(`\`, \``)}\``)
    } catch (err) {
     console.error(err);
     }

  }
};
