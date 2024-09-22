const mysql = require('mysql');
const { v4 } = require('uuid');

const OHLCV_TABLE_NAME = 'ohlcv';

const DBClient = {
    conn: null,

    Exec(query, vals) {
        if (!this.conn) {
            this.conn = mysql.createPool({
                connectionLimit: 10,
                host: "localhost",
                acquireTimeout: 300 * 1000, //300 secs
                user: 'jli',
                password: 'JerryLi1234!',
                database: 'quant'
            });
            console.log('DB pool created');
        }

        const promise = new Promise((res, rej) => {
            this.conn.query(query, vals, (err, result) => {
                if (err) rej(err);
                else res(result);
            })
        });
        return promise;
    },

    GetOHLCVTableNameByDatetime(datetime) {
        const thisYear = new Date().getFullYear();
        const dataYear = new Date(datetime).getFullYear();
        let tableName = OHLCV_TABLE_NAME;
        if (dataYear !== thisYear) {
            tableName = `${OHLCV_TABLE_NAME}_${dataYear}`;
        }

        return tableName;
    },

    GetOHLCV(symbol, datetime, dataLevel) {
        const tableName = this.GetOHLCVTableNameByDatetime(datetime);

        const query = `SELECT * FROM ${tableName} WHERE symbol = ? AND level = ? AND date_time = ?`;

        return this.Exec(query, [symbol, dataLevel, 
            datetime]);
    },

    InsertOHLCV(ohlcv) {
        const uuid = v4();
        const columes = ['assetId', 'symbol', 'level', 'datetime', 'open', 'high', 'low', 'close', 'adjClose', 'volume'];

        const vals = [uuid];
        columes.forEach((colume, i) => {
            if (ohlcv[colume] === undefined) {
                throw new Error(`field: ${colume} is missing`);
            }
            vals.push(ohlcv[colume]);
        });

        const tableName = this.GetOHLCVTableNameByDatetime(ohlcv.datetime);

        const query = `INSERT INTO ${tableName} (id, asset_id, symbol, level, date_time, open, high, low, close, adj_close, volume) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;

        return this.Exec(query, vals);
    },

    GetAsset(symbol, type) {
        const query = 'SELECT * from assets WHERE symbol = ? AND asset_type = ?';

        return this.Exec(query, [symbol, type]);
    },

    InsertAsset(asset) {
        const query = 'INSERT INTO assets (id, asset_type, symbol, name) VALUES (?,?,?,?)';

        asset.id = v4();

        return this.Exec(query, [asset.id, asset.type, asset.symbol, asset.name]);
    },

    Close() {
        if (this.conn) {
            this.conn.end();
            console.log('DB pool ended')
        }
    },
};

module.exports = DBClient;