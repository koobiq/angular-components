const { readdirSync } = require('fs');
const { resolve } = require('path');

const getMigrations = () =>
    readdirSync(resolve(__dirname, '../migrations'), { withFileTypes: true })
        .filter((file) => file.isDirectory())
        .map((dir) => dir.name);

module.exports = {
    getMigrations
};
