const moment = require('moment-timezone');

const TIMEZONE = 'UTC';

const defaultTimezoneOffset = {
    EDT: '-04:00',
    UCT: 'Z'
};

const getTimezoneOffset = (timezone) => {
    if (!defaultTimezoneOffset[timezone]){
        console.warn(`timezone: ${timezone} not recognizable, using UTC instead`);
        return defaultTimezoneOffset.UCT;
    } 

    return defaultTimezoneOffset[timezone];
};

const containsTimezone = (datetime) => {
    if (!datetime) {
        return false;
    }

    if (datetime.toLowerCase().endsWith('z')) {
        return true;
    }

    const parts = datetime.split(' ');
    if (parts.length == 3) {
        return true;
    }
    if (parts.length == 2) {
        const timepart = parts[1];
        if (timepart.includes('-') || timepart.includes('+')) {
            return true;
        }
    }

    return false;
};

const dtUtil = {
    ConvertToUTC: (datetime, srcTimezone) => {
        if (containsTimezone(datetime)) {
            const dt = new Date(datetime);
            return moment(dt).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
        }

        const timezoneOffset = getTimezoneOffset(srcTimezone);
        const dt = new Date(`${datetime}${timezoneOffset}`);
        return moment(dt).tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
    },  
};

module.exports = dtUtil;