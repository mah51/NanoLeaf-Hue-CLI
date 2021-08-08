const axios = require('axios');

module.exports = {

  flashNanoLeaf: async (api) => {
    let data = JSON.stringify({"on":{"value":false}});
    axios.put(api + '/state', data).then(() => {
      data = JSON.stringify({"on":{"value":true}});
      setTimeout(() => {
        axios.put(api + '/state', data).catch(console.error);
      }, 2000)
    })
  },

  flashHue: async (api) => {
    const lights = ['1', '2']
    lights.forEach((light) => {
      axios.put(api + '/' + light + '/state', {
        on: false
      })
        .then(() => {
          setTimeout( async () => {
            await axios.put(api  + '/' + light + '/state', {
              on: true
            })
          }, 2000)

        })
    })
    return true;


  }
}
