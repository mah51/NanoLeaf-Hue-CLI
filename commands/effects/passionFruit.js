const Commando = require('discord.js-commando');
const {setNanoLeafEffect, setHueLights, isDay} = require('../../functions/apiFunctions')
const chalk = require('chalk');

module.exports = class  extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'passion-fruit',
      aliases: [
        'pf',
        'passion'
      ],
      group: 'effects',
      memberName: 'passion-fruit',
      description: 'Passion froot',
      details: '',
      examples: [

      ],
      args: [
        {
          key: 'brightness',
          label: 'brightness',
          prompt: 'What brightness you want?',
          type: 'integer',
          validate: (q) => {
            return q >= 0 && q <= 100
          },
          default: 101
        },
      ],
      guildOnly: false,
    });
  }

  async run(msg, {brightness}, fromPattern, result) {
    try {
      if (brightness === 101) {
        const isday = await isDay()
        brightness = isday ? 75 : 50
      }
      const hueBrightness = Math.round(brightness * 2.54)
      if (!await setNanoLeafEffect(this.client.URLS.nanoLeaf, 'Passionfruit', brightness)) {
        return msg.reply('NanoLeaf failed to change')
      }
      if (!await setHueLights(this.client.URLS.hue, [255,157,28, hueBrightness], [248,145,255, hueBrightness])) {
        return msg.reply('Hue failed to change')
      }
      await msg.reply('Successfully changed lights to Passion Fruit preset in Michael\'s bedroom :)')
      console.log(chalk.blueBright('Set Michael\'s bedroom to minty'))
    } catch (err) {
      console.error(err);
    }

  }
};
