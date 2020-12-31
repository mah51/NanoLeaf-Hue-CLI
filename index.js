const {hueConnect, nanoLeafConnect} = require('./functions/connect')
const {flashNanoLeaf, flashHue} = require('./functions/flashWhite')
const {isDay, setNanoLeafEffect, setHueLights} = require('./functions/apiFunctions');
const chalk = require('chalk');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
require('dotenv').config()


const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`

const setup = async () => {
  const nanoLeafState = await nanoLeafConnect(nanoLeafAPI)
  const hueState = await hueConnect(hueAPI)
  await flashHue(hueAPI)
  await flashNanoLeaf(nanoLeafAPI);
}



  async function main() {
    const isday = await isDay()
    readline.question('What effect would you like to activate? (add , and a number between 0-100 if you would like to set brightness manually)', async input => {
      const effectName = input.split(', ')[0]
      const brightInput = parseInt(input.split(',')[1])
      const brightness =  brightInput ? brightInput : isday ? 75 : 50
      const hueBrightness = Math.round(brightness * 2.54)
      let nano = false
      let hue = false
      switch (effectName.toLowerCase()) {
        case 'mint':
        case 'minty':
        case 'm':
          nano = await setNanoLeafEffect(nanoLeafAPI, 'Mint', brightness)
          hue = await setHueLights(hueAPI, [50,143,150, hueBrightness], [30,143,150, hueBrightness])
          break;
        case 'gamer':
        case 'game':
        case 'g':
          nano = await setNanoLeafEffect(nanoLeafAPI, 'Gamer', brightness)
          hue = await setHueLights(hueAPI, [90,10,255, hueBrightness], [255,0,6, hueBrightness])
          break;
        case 'passionfruit':
        case 'passion':
        case 'p':
          nano = await setNanoLeafEffect(nanoLeafAPI, 'Passionfruit', brightness)
          hue = await setHueLights(hueAPI, [255,157,28, hueBrightness], [248,145,255, hueBrightness])
          break;
        case 'playstation':
        case 'blue':
        case 'b':
          nano = await setNanoLeafEffect(nanoLeafAPI, 'Playstation Blue', brightness)
          hue = await setHueLights(hueAPI, [0,67,156, hueBrightness], [0,112,204, hueBrightness])
          break;
        case 'tropical':
        case 't':
          nano = await setNanoLeafEffect(nanoLeafAPI, 'Tropical Waterfall', brightness)
          hue = await setHueLights(hueAPI, [255,123,0, hueBrightness], [255,0,102, hueBrightness])
        break;
        case 'quit':
        case 'q':
          process.exit(0);
          break;
        default:
          console.log('That isn\'t an effect, please try again.')
          break;
      }
      if (!nano && !hue) {
        console.log('No lights could be activated')
      } else if (!nano){
        console.log('Nanoleaf lights did not respond')
      } else if (!hue) {
        console.log('Hue lights did not respond')
      } else {
        console.log(`Successfully changed to ${effectName[0].toUpperCase() + effectName.slice(1)} preset :).`)
      }
      main().catch(console.error);
    })

  }

setup().then(async () => {
  console.log('setup complete')
  main().catch(console.error);
}).catch(console.error);








