const mysql = require('mysql');
const { v4 } = require('uuid');

const exec = (conn, query, vals) => {
    const promise = new Promise((res, rej) => {
        conn.query(query, vals, (err, result) => {
            if (err) rej(err);
            else res(result);
        })
    });
    return promise;
};

const Persistor = {
    conn: null,

    InitConnection: () => {
        this.conn = mysql.createPool({
            connectionLimit: 10,
            host: "localhost",
            acquireTimeout: 300 * 1000, //300 secs
            user: 'jli',
            password: 'JerryLi1234!',
            database: 'quant'
        });
    },


    GetOHLCV: (symbol, datetime) => {
        const query = 'SELECT * FROM ohlcv WHERE symbol = ? AND date_time = ?';

        return exec(this.conn, query, [symbol, datetime]);
    },

    InsertOHLCV: (ohlcv) => {
        const uuid = v4();
        const columes = ['assetId', 'symbol', 'level', 'dateTime', 'open', 'high', 'low', 'close', 'adjClose', 'volume'];

        const vals = [uuid];
        columes.forEach((colume, i) => {
            if (!ohlcv[colume]) {
                throw new Error(`field: ${colume} is missing`);
            }
            vals.push(ohlcv[colume]);
        });

        const query = 'INSERT INTO ohlcv (id, asset_id, symbol, level, date_time, open, high, low, close, adj_close, volume) VALUES (?,?,?,?,?,?,?,?,?,?,?)';

        return exec(this.conn, query, vals);
    },

    GetAsset: (symbol) => {
        const query = 'SELECT * from assets WHERE symbol = ?';

        return exec(this.conn, query, symbol);
    },

    InsertAsset: (asset) => {
        const query = 'INSERT INTO assets (id, asset_type, symbol, name) VALUES (?,?,?,?)';

        asset.id = v4();

        return exec(this.conn, query, [asset.id, asset.type, asset.symbol, asset.name]);
    },

    Close: () => {
        this.con.end();
        console.log('db client disconnected')
    },
};

module.exports = Persistor;