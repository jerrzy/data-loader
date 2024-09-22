const dbClient = require("./db_client");

const getOHLCVDDL = (year) => `
CREATE TABLE ohlcv${year ? '_' + year : ''}(
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    symbol VARCHAR(20) NOT NULL,  -- 冗余字段
    level ENUM('second', 'minute', 'hour', 'day') NOT NULL,
    open DECIMAL(18, 4) NOT NULL,
    high DECIMAL(18, 4) NOT NULL,
    low DECIMAL(18, 4) NOT NULL,
    close DECIMAL(18, 4) NOT NULL,
    adj_close DECIMAL(18, 4) NOT NULL, -- 新增调整后的收盘价列
    volume DECIMAL(18, 4) NOT NULL,
    date_time DATETIME NOT NULL,
    INDEX idx_symbol_level_datetime(symbol, level, date_time),
    INDEX idx_assetid(asset_id)
);
`

const assetTableDDL = `
CREATE TABLE assets (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    asset_type ENUM('stock', 'option', 'crypto', 'perpetual') NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    UNIQUE (symbol)
);
`;

const startYear = 2000;
const endYear = new Date().getFullYear() - 1;

const createDBTables = async () => {
    // aasets
    try {
        await dbClient.Exec(assetTableDDL);
        console.log('assets table created');
    } catch(err) {
        console.warn(err.message);
    }

    // ohlcv
    try {
        await dbClient.Exec(getOHLCVDDL());
        console.log('ohlcv table created');
    } catch(err) {
        console.warn(err.message);
    }

    // history ohlcv tables
    for (let i = startYear; i <= endYear; i++) {
        const query = getOHLCVDDL(i);
    
        try {
            await dbClient.Exec(query);

            console.log(`table year ${i} created`);
        } catch (err) {
            console.warn(err.message);
        }
    }
    
    dbClient.Close();
}

createDBTables();