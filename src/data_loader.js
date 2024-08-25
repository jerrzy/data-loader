const fs = require("fs");
const path = require("path");

const persistor = require('./persistor');

persistor.InitConnection();

const { ConvertToUTC } = require("./time_util");
const loadCSVFile = require("./csv_loader");

const loadCSV = async (asset, timezone) => {
    const rows = await loadCSVFile(asset.sourceFilePath);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const dt = ConvertToUTC(row.DateTime, timezone);
        try {
            const existingOHLCV = await persistor.GetOHLCV(asset.symbol, dt);
            if (!existingOHLCV.length) {
                // insert only if doesn't exist
                persistor.InsertOHLCV({
                    assetId: asset.id,
                    symbol: asset.symbol,
                    level: asset.level,
                    dateTime: dt,
                    open: row.Open,
                    high: row.High,
                    low: row.Low,
                    close: row.Close,
                    adjClose: row['Adj Close'],
                    volume: row.Volume,
                });
            }
        } catch (err) {
            console.error(`inserting row: ${i} in file: ${asset.sourceFilePath} failed, detail: ${JSON.stringify(row)}, error: ${err.message}`);
        }
    }
};

const WalkDir = (dataRootPath) => fs.readdir(dataRootPath, async (err, files) => {
    if (err) throw err;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        console.log(file);

        const symbol = file.substring(0, file.length - 4);
        if (!symbol) {
            console.error(`ticker not found in source file name: ${file}`);
            return;
        }

        // insert asset
        try {
            const results = await persistor.GetAsset(symbol);
            
            const asset = {};

            if (!results.length) {
                asset.type = 'stock';
                asset.symbol = symbol;
                asset.name = symbol;

                console.log(`inserting new asset ${symbol}`)
                await persistor.InsertAsset(asset);
            } else {
                const existingAsset = results[0];
                
                asset.id = existingAsset.id;
                asset.type = existingAsset.asset_type;
                asset.symbol = existingAsset.symbol;
                asset.name = existingAsset.name;
            }

            asset.sourceFilePath = path.join(dataRootPath, file);

            await loadCSV(asset, 'EDT');
        } catch (err) {
            console.log(err.message);
        }
    }
});

module.exports = WalkDir;