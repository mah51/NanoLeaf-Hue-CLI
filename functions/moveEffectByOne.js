const chalk = require("chalk");
const effects = require("../effects");
const { setHueLights, setNanoLeafEffect } = require("./apiFunctions");
const nanoLeafAPI = `http://${process.env.NANOLEAFIP}:16021/api/v1/${process.env.NANOLEAFAUTH}`;

const hueAPI = `http://${process.env.HUEIP}/api/${process.env.HUEAUTH}/lights`;
module.exports = async function (
  direction,
  brightness,
  currentEffect,
  setCurrentEffect
) {
  effects.forEach(async (effect, index) => {
    if (effect.names.includes(currentEffect)) {
      const newEffect =
        effects[
          index + direction === -1
            ? effects.length - 1
            : (index + direction) % effects.length
        ];
      const nano = await setNanoLeafEffect(
        nanoLeafAPI,
        newEffect.nanoLeaf,
        brightness
      );
      const hue = await setHueLights(
        hueAPI,
        [...newEffect.hue1, brightness],
        [...newEffect.hue2, brightness]
      );
      if (nano && hue) {
        console.log(
          chalk`{magenta.bold Effect changed to {red.bold ${newEffect.names[0]}} with keyboard}`
        );
      }
      setCurrentEffect(newEffect.names[0]);
    }
  });
};
