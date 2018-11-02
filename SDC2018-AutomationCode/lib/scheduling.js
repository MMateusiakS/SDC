const rp = require('request-promise');

module.exports = {

  createCron: function (cronExpression, timeZone, installedAppId, baseUrl, token) {

    const path = `/installedapps/${installedAppId}/schedules`;

    const scheduleRequest = {
      once: null,
      name: 'air-check-schedule',
      cron: {
        expression: cronExpression,
        timezone: timeZone
      }
    };
    const options = {
      url: `${baseUrl}${path}`,
      method: 'POST',
      json: true,
      body: scheduleRequest,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    return rp(options);
  },

  deleteSchedules: function (installedAppId, baseUrl, token) {

    const path = `/installedapps/${installedAppId}/schedules`;

    const options = {
      url: `${baseUrl}${path}`,
      method: 'DELETE',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    return rp(options);
  }
};