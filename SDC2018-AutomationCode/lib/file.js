const fs = require('fs');
const filePath = 'air.txt';

module.exports = {

  createFile: function () {

    const fileContent = 'Air conditions information logs';

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) throw err;
      console.log('The file was successfully saved!');
    });
  },

  openFileAndAppendData: function (airData) {

    fs.appendFileSync(filePath, airData);

  }
};
