function createConfigInitializeSetting() {
  return {
    name: 'Air condition monitoring',
    description: 'Bulb color by current temp',
    id: 'app',
    permissions: ['r:schedules', 'w:schedules'],
    firstPageId: '1'
  }
}

function createConfigPage(pageId, currentConfig) {
  if (pageId !== '1') {
    throw new Error(`Unsupported page name: ${pageId}`);
  }

  return {
    pageId: '1',
    name: 'Bulb color by air condition',
    nextPageId: null,
    previousPageId: null,
    complete: true,
    sections: [
      {
        name: 'For the air condition',
        settings: [
          {
            id: 'city',
            name: 'Select City',
            description: 'Check air quality in the city',
            type: 'ENUM',
            required: true,
            options: [{ id: 'london', name: 'London' }, { id: 'losangeles', name: 'Los Angeles' }, {
              id: 'tokyo',
              name: 'Tokyo'
            }, { id: 'shanghai', name: 'Shanghai' }, { id: 'jodhpur', name: 'Jodhpur' }]
          },
          {
            id: 'scheduleInterval',
            name: 'How often to check air conditions?',
            description: 'Tap to set',
            type: 'ENUM',
            required: true,
            multiple: false,
            options: [
              {
                id: 'schedule-interval-15-minutes',
                name: '15 Minutes'
              },
              {
                id: 'schedule-interval-30-minutes',
                name: '30 Minutes'
              },
              {
                id: 'schedule-interval-45-minutes',
                name: '45 Minutes'
              },
              {
                id: 'schedule-interval-60-minutes',
                name: '60 Minutes'
              }
            ]
          },
        ]
      },
      {
        name: 'Set the color of this light',
        settings: [
          {
            id: 'colorLight',
            name: 'Which color light?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['colorControl', 'switch', 'switchLevel'],
            permissions: ['r', 'x']
          }
        ]
      },
      {
        name: 'Turn the siren on',
        settings: [
          {
            id: 'siren',
            name: 'Which siren?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: true,
            capabilities: ['switch', 'alarm'],
            permissions: ['r', 'x']
          }
        ]
      },
      {
        name: 'Turn the fan on',
        settings: [
          {
            id: 'fan',
            name: 'Which fan?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: true,
            capabilities: ['switch'],
            permissions: ['r', 'x']
          }
        ]
      },

      {
        name: 'Check windows',
        settings: [
          {
            id: 'contactSensor',
            name: 'Which open close?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: true,
            capabilities: ['contactSensor'],
            permissions: ['r']
          }
        ]
      }
    ]
  };
}

module.exports = {

  handle: function (event) {
    if (!event.config) {
      console.log('No config section set in request.');
      throw new Error('No config section set in request.');
    }
    let config = {};
    const phase = event.phase;
    const pageId = event.pageId;
    const settings = event.config;
    switch (phase) {
      case 'INITIALIZE':
        config.initialize = createConfigInitializeSetting();
        break;
      case 'PAGE':
        config.page = createConfigPage(pageId, settings);
        break;
      default:
        throw new Error(`Unsupported config phase: ${phase}`);
    }
    return config;
  },

  getScheduleInterval(selectedOption) {
    let interval = null;
    switch (selectedOption) {
      case 'schedule-interval-15-minutes': {
        interval = 1;
        break;
      }
      case 'schedule-interval-30-minutes': {
        interval = 30;
        break;
      }
      case 'schedule-interval-45-minutes': {
        interval = 45;
        break;
      }
      case 'schedule-interval-60-minutes': {
        interval = 60;
        break;
      }
      default: {
        interval = 60;
        break;
      }
    }
    return interval;
  }
};
