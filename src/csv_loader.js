const csvParser = require("csv-parser");
const fs = require("fs");

const loadCSVFile = (filePath) => {
    const rows = [];
    return new Promise((res, rej) => {
        fs.createReadStream(filePath).pipe(csvParser())
        .on('data', (row) => {
            rows.push(row);
        })
        .on('end', () => {
            res(rows);
        })
        .on('error', (err) => {
            rej(err);
        })
    })
};


module.exports = loadCSVFile