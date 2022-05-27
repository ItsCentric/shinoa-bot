const fs = require('fs');

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f=> f.endsWith(ending))
}

const formatString = (string, character = ' ') => {
    let filteredString = '';
    let splitString = string.split(`${character}`);

    for (i = 0; i < splitString.length; i++) {
        filteredString += `${splitString[i][0].toUpperCase()}${splitString[i].substring(1)} `;
    }

    return filteredString;
}

module.exports = { getFiles, formatString };