const rp = require('request-promise');
const stApi = require('./appConfig').smartThingsApi;

module.exports = {

  createSubscription: function (installedApp, authToken) {

    const path = `/installedapps/${installedApp.installedAppId}/subscriptions`;

    let subRequest =
      {
        sourceType: 'DEVICE',
        device: {
          componentId: installedApp.config.contactSensor[0].deviceConfig.componentId,
          deviceId: installedApp.config.contactSensor[0].deviceConfig.deviceId,
          capability: 'contactSensor',
          attribute: 'contact',
          value: 'open',
          stateChangeOnly: true,
        }
      };

    const options = {
      url: `${stApi}${path}`,
      method: 'POST',
      json: true,
      body: subRequest,
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    };

    rp(options)
  },

  deleteSubscription: function (installedApp, authToken) {

    const path = `/installedapps/${installedApp.installedAppId}/subscriptions`;

    const options = {
      url: `${stApi}${path}`,
      method: 'DELETE',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    };

    rp(options)
  }
};
