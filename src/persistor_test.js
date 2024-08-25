const dbClient = require('./persistor');
dbClient.initConnection();

const testGetAsset = async () => {
    const ret = await dbClient.GetAsset('A');
    console.log(ret);
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
            dateTime: now,
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

const testTimeConvertion = () => {
    const dt = '2023-01-03 09:30:00';

};

// testGetAsset();
// testInsertAsset();
// testInsertOHLCV();

