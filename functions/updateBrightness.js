const axios = require("axios");

module.exports = async (
  direction,
  oldBrightness,
  setBrightness,
  nanoLeafAPI,
  hueAPI
) => {
  let newBrightness = oldBrightness + direction * 10;
  if (newBrightness > 100 || newBrightness < 0) {
    newBrightness = newBrightness > 50 ? 100 : 0;
  }
  await axios.put(hueAPI + "/" + "1" + "/state", {
    on: newBrightness > 0,
    bri: Math.round(newBrightness * 2.54),
  });

  await axios.put(hueAPI + "/" + "2" + "/state", {
    on: newBrightness > 0,
    bri: Math.round(newBrightness * 2.54),
  });

  await axios.put(`${nanoLeafAPI}/state`, {
    brightness: { value: newBrightness },
  });

  setBrightness(newBrightness);
};
