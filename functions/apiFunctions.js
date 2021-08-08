const axios = require("axios");
const converter = require("@q42philips/hue-color-converter");

module.exports = {
  getNanoLeafEffect: async (api) => {
    const { data } = await axios.get(`${api}/effects/effectsList`);
    return data;
  },
  setNanoLeafEffect: async (api, effect, brightness) => {
    const data = await axios.put(`${api}/effects`, {
      select: effect,
    });
    const data1 = await axios.put(`${api}/state`, {
      brightness: { value: brightness },
    });
    return data.status === 204 && data1.status === 204;
  },
  setHueLights: async (api, light1, light2) => {
    await axios.put(api + "/" + "1" + "/state", {
      on: true,
    });
    await axios.put(api + "/" + "2" + "/state", {
      on: true,
    });
    const { data } = await axios.put(api + "/2/state", {
      xy: converter.calculateXY(light2[0], light2[1], light2[2], "LCT010"),
      bri: light2[3],
    });

    if (!data[0] || !data[0].success || !data[1] || !data[1].success) {
      return false;
    }

    const hue1 = await axios.put(api + "/1/state", {
      xy: converter.calculateXY(light1[0], light1[1], light1[2], "LCT010"),
      bri: light1[3],
    });

    if (
      !hue1.data[0] ||
      !hue1.data[0].success ||
      !hue1.data[1] ||
      !hue1.data[1].success
    ) {
      return false;
    }
    return true;
  },
};
