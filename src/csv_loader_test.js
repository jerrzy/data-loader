const loadCSVFile = require("./csv_loader");

const testFile = 'C:/Users/jerryli/Documents/quant/data/1H-20240824T164214Z-001/1H/A.csv';

const testLoadCSV = async (path) => {
    const data = await loadCSVFile(path);

    console.log(data);
}

testLoadCSV(testFile);