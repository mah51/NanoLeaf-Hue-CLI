const axios = require("axios");
module.exports = async (cache, setIsOn, nanoLeafAPI, hueAPI) => {
  await axios.put(hueAPI + "/" + "1" + "/state", {
    on: !cache,
  });
  await axios.put(hueAPI + "/" + "2" + "/state", {
    on: !cache,
  });
  await axios.put(`${nanoLeafAPI}/state`, {
    on: { value: !cache },
  });
  setIsOn(!cache);
};
