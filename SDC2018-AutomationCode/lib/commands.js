const rp = require('request-promise');
const stApi = require('./appConfig').smartThingsApi;

module.exports = {

  actuate: function (deviceId, token, commands) {

    const path = `/devices/${deviceId}/commands`;

    const options = {
      url: `${stApi}${path}`,
      method: 'POST',
      json: true,
      body: commands,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    return rp(options);
  }
};
