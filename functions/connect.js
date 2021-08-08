const axios = require('axios');
const chalk = require('chalk');

module.exports = {

  nanoLeafConnect: async (api) => {
    const {data} = await axios.get(api)
    if (!data) {
      return new Error('Nanoleaf failure to connect');
    }
    console.log(chalk.bold(chalk.magentaBright('Connected to Nanoleaf - ') + chalk.blueBright(data.name)));
    console.log(chalk.magenta('Possible effects - ') +  chalk.greenBright(data.effects.effectsList.join(chalk.blueBright(', '))))
    console.log(chalk.magenta('Current effect - ') + chalk.blueBright(data.effects.select) + '\n')
    return data;
  },

  hueConnect: async (api) => {
    const {data} = await axios.get(api)
    if (!data) {
      return new Error('Hue failure to connect');
    }
    console.log(chalk.bold(chalk.magentaBright('Connected to Hue - ') + chalk.blueBright(Object.keys(data).map(key => data[key].name).join(chalk.greenBright(', ')))))
    return data;
  }
}
