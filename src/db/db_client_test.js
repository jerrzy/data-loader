const dbClient = require('./db_client');

const testGetAsset = async () => {
    try {
        const ret = await dbClient.GetAsset('A');
        console.log(ret);
    } catch (err) {
        console.error(err.message);
    }
};

const testInsertAsset = async () => {
    try{
        const ret = await dbClient.InsertAsset({
            symbol: 'stock',
            symbol: 'AAAAA',
            name: 'AAAAA'
        });
        console.log(ret);
    } catch (err) {
        console.log(err.message);
    }
}

const testInsertOHLCV = async () => {
    const now = Date();

    try {
        const ret = await dbClient.InsertOHLCV({
            assetId: '123',
            symbol: 'A',
            datetime: now,
            open: 1.1,
            high: 1.2,
            low: 1.3,
            close: 1.4,
            adjClose: 1.5,
            volume: 1,
        });
        console.log(ret);
    } catch (err) {
        console.log(err.message);
    }
}

const test = async () => {
    await testGetAsset();
    // testInsertAsset();
    // testInsertOHLCV();

    dbClient.Close();
}

test();


