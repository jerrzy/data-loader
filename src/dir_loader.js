const fs = require("fs");
const path = require("path");

const dbClient = require('./db/db_client');

const { ConvertToUTC } = require("./time_util");
const loadCSVFile = require("./csv_loader");

const DEFAULT_TIMEZONE = 'EDT';

const ASSET_TYPE = {
    stock: 'stock',
    option: 'option',
    crypto: 'crypto',
    perpetual: 'perpetual'
}

const DATA_LEVEL = {
    hour: /hourly|hour|h/gi,
    day: /daily|day|d/gi,
    minute: /minute|min|m/gi,
    second: /second|sec|s/gi,
}

const loadCSV = async (asset, timezone, dataLevel) => {
    const rows = await loadCSVFile(asset.sourceFilePath);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const dt = ConvertToUTC(row.DateTime, timezone);
        try {
            const existingOHLCV = await dbClient.GetOHLCV(asset.symbol, dt);
            if (!existingOHLCV.length) {
                // insert only if doesn't exist
                dbClient.InsertOHLCV({
                    assetId: asset.id,
                    symbol: asset.symbol,
                    level: asset.level,
                    datetime: dt,
                    open: row.Open || 0,
                    high: row.High || 0,
                    low: row.Low || 0,
                    close: row.Close || 0,
                    adjClose: row['Adj Close'] || 0,
                    volume: row.Volume || 0,
                });
            }
        } catch (err) {
            console.error(`inserting row: ${i} in file: ${asset.sourceFilePath} failed, detail: ${JSON.stringify(row)}, error: ${err.message}`);
        }
    }
};

const WalkDir = async (dir, assetType, dataLevel, assets) => fs.readdirSync(dir).map(async fileName => {
    const filePath = path.join(dir, fileName);

    console.log(`processing: ${filePath}`);
    if (!fs.lstatSync(filePath).isFile()) {
        // let assetType, dataLevel;
        if (ASSET_TYPE[fileName.toLowerCase()]) {
            assetType = fileName.toLowerCase();
        }

        Object.keys(DATA_LEVEL).forEach(level => {
            const levelRegex = DATA_LEVEL[level];
            if (fileName.search(levelRegex) > -1) {
                dataLevel = level;
            }
        });

        await WalkDir(filePath, assetType, dataLevel, assets)
    }

    if (!fileName.toLowerCase().endsWith('.csv')) {
        console.warn(`skipping ${fileName}`);
        return;
    }
    
    if (!assetType || !dataLevel) {
        console.error(`missing asserType: ${assetType} or dataLevel: ${dataLevel}, skipping ${fileName}`);
        return;
    }

    const symbol = fileName.substring(0, fileName.length - 4);
    if (!symbol) {
        console.error(`ticker not found in source file name: ${fileName}, skipping ${fileName}`);
        return;
    }

    assets.push({
        symbol,
        type: assetType,
        level: dataLevel,
        sourceFilePath: filePath,
    });
});

/*
{
    symbol,
    type,
    level,
    sourceFilePath,
}
*/
const LoadCSVs = async (assets) => {
    for (let i = 0; i < assets.length; i++) {
        const asset = 
        assets[i];

        try {
            const results = await dbClient.GetAsset(asset.symbol, asset.type);
            
            console.log(`returned result: ${results} for file: ${asset.sourceFilePath}`);
    
            if (!results.length) {
                console.log(`inserting new asset ${asset}`)
                await dbClient.InsertAsset(asset);
            } else {
                const existingAsset = results[0];
                asset.id = existingAsset.id;
            }
    
            console.log(`loading: ${asset.sourceFilePath} started...`);
            await loadCSV(asset, DEFAULT_TIMEZONE, asset.dataLevel);
            console.log(`loading: ${asset.sourceFilePath} completed`);
        } catch (err) {
            console.log(err.message);
        }
    }
};

module.exports = {
    WalkDir,
    LoadCSVs,
};