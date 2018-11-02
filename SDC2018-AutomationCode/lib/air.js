const rp = require('request-promise');
const airUrl = require('./appConfig').airQualityApi;
const colorType = require('../constants/colors');
const airQualityApiKey = require('./appConfig').airQualityApiKey;

module.exports = {

    getAirConditionsInfo: function (selectedCity) {

        const options = {
            url: airUrl + '/?lat=' + selectedCity.lat + '&lon=' + selectedCity.long + '&key=' + airQualityApiKey
        };

        return rp(options);
    },


    getColorForAirCondition: function (airState) {

        airState = JSON.parse(airState);
        let color;
        const airCondition = airState['breezometer_description'];

        console.log('getColorForAirCondition: ' + airCondition)

        if (airCondition === 'Excellent air quality') {
            color = colorType.GREEN;
        } else if (airCondition === 'Good air quality') {
            color = colorType.GREEN;
        } else if (airCondition === 'Moderate air quality') {
            color = colorType.BLUE;
        } else if (airCondition === 'Low air quality') {
            color = colorType.RED;
        } else if (airCondition === 'Poor air quality') {
            color = colorType.RED;
        } else {
            color = colorType.WHITE;
        }
        console.log(color);

        return color;
    },


    getGeoCoordinates: function (city) {

        let cityCoordinates;

        switch (city) {
            case 'london':
                cityCoordinates = {'lat': '51.5', 'long': '-0.1'};
                break;
            case 'losangeles':
                cityCoordinates = {'lat': '34.0', 'long': '-118.2'};
                break;
            case 'tokyo':
                cityCoordinates = {'lat': '35.6', 'long': '139.8'};
                break;
            case 'shanghai':
                cityCoordinates = {'lat': '31.2', 'long': '121.4'};
                break;
            case 'jodhpur':
                cityCoordinates = {'lat': '25.3', 'long': '73.0'};
                break;
            default:
        }

        return cityCoordinates;
    }
};