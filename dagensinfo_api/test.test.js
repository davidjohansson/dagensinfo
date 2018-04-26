const moment = require('moment');

test('valid timestamp is a proper moment object', () => {
   let m = moment('2018-04-23').format('YYYY-MM-DD');
   expect(m).toBe('2018-04-23');
    }
);

test('invalid timestamp is a proper moment object', () => {
    let m = moment('2018dd-04-23').format('YYYY-MM-DD');
    expect(m).toBe('Invalid date');
     }
 );

 test('moment object with UTC time zone can be displayed using Z ', () => {
    let m = moment('2018-04-23').hour(12).minute(0).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    expect(m).toBe('2018-04-23T10:00:00Z');
     }
 );