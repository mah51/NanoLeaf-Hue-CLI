const {hueConnect, nanoLeafConnect} = require('./functions/connect')
const {flashNanoLeaf, flashHue} = require('./functions/flashWhite')
const {isDay, setNanoLeafEffect, setHueLights} = require('./functions/apiFunctions');
const effects = require('./effects');
const chalk = require('chalk');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
require('dotenv').config()

const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`

const setup = async () => {
  await nanoLeafConnect(nanoLeafAPI)
  await hueConnect(hueAPI)
  await flashHue(hueAPI)
  await flashNanoLeaf(nanoLeafAPI);
}

  async function main() {
    const isday = await isDay()
    readline.question(chalk.bold.blueBright('What effect would you like to activate?') + '(add , and a number between 0-100 if you would like to set brightness manually)', async input => {
      const effectName = input.split(', ')[0]
      const brightInput = parseInt(input.split(',')[1])
      const brightness =  brightInput ? brightInput : isday ? 75 : 50
      const hueBrightness = Math.round(brightness * 2.54)

      if (['quit', 'q'].includes(effectName)){
        return process.exit(0)
      }
      for (const effect of effects) {
        if (effect.names.includes(effectName)) {
          const nano = await setNanoLeafEffect(nanoLeafAPI, effect.nanoLeaf, brightness)
          const hue = await setHueLights(hueAPI, [ ...effect.hue1, hueBrightness] ,[ ...effect.hue2, hueBrightness])

          if (!nano && !hue) {
            console.error('No lights responded')
          } else if (!hue) {
            console.error('Hue lights did not respond')
          } else if (!nano) {
            console.error('Nano lights did not respond')
          } else {
            console.log(chalk.bold.magentaBright('Effect changed.'))
          }
        }
      }
      main().catch(console.error);
    })

  }

setup().then(async () => {
  console.log('setup complete')
  main().catch(console.error);
}).catch(console.error);








