const rp = require('request-promise');
const slack = require('./appConfig').slackApi;

module.exports = {

  sendMessage: function (deviceEvent) {

    const options = {
      url: slack,
      method: 'POST',
      json: true,
      body: { 'text': 'Alert! Poor air quality! Close your window.' + deviceEvent.toString() },
      headers: {
        'Content-type': 'application/json'
      }
    };

    return rp(options);
  },

  createMessage: function (airState) {

    airState = JSON.parse(airState);

    let message;

    let childrenMessage = airState.random_recommendations.children;
    let sportMessage = airState.random_recommendations.sport;
    let healthMessage = airState.random_recommendations.health;
    let insideMessage = airState.random_recommendations.inside;

    message = childrenMessage + '.' + sportMessage + '.' + healthMessage + '.' + insideMessage + '.';

    return message;
  }
};
