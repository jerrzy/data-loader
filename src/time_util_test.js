const { ConvertToUTC } = require("./time_util");

const testConvertToUTC = (datetime, srcTimezone) => {
    const dt = ConvertToUTC(datetime, srcTimezone);
    console.log(dt);
}

testConvertToUTC('2023-01-03 09:30:00', 'EDT');

testConvertToUTC('2023-01-03 09:30:00Z', '');