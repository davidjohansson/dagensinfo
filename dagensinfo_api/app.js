const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const {makeExecutableSchema} = require('graphql-tools');
const cors = require('cors');
const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');

const typeDefs = `
  type Query { 
     matblasbo(date: String!): String
     matkristiansborg: String
     temp(date: String!): DayValue!
  }
  
  type DayValue {
        morning: Float
        noon: Float
        evening: Float
     }
`;

let temp = (obj, args, context, info) => {

    const options = {
        uri: 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/16.548702/lat/59.621899/data.json',
        transform: body => {
            return JSON.parse(body)
        }
    };

    return rp(options)
        .then((parsed) => {
            let tempFinder = (time) => {
                let value = parsed.timeSeries.find(it => it.validTime === time);
                return value ? value.parameters.find(it => it.name === 't').values[0] : null;
            };

            let formatDateAtHour = (date, hour) => {
                return moment(date).hour(hour).minute(0).utc().format('YYYY-MM-DDTHH:mm:ss[Z]')
            }

            let morningDateTimeZone = formatDateAtHour(args.date, 8);
            let noonDateTimeZone = formatDateAtHour(args.date, 12);
            let eveningDateTimeZone = formatDateAtHour(args.date, 18);
            console.log(morningDateTimeZone);

            let morningVal = tempFinder(morningDateTimeZone);
            let noonVal = tempFinder(noonDateTimeZone);
            let eveningVal = tempFinder(eveningDateTimeZone);

            return {
                morning: morningVal,
                noon: noonVal,
                evening: eveningVal
            }
        }).catch((error) => {
            console.log(error)
        });
};

let matblasboFunktion = (obj, args, context, info) => {

    const options = {
        uri: "https://mpi.mashie.com/public/menu/v%C3%A4ster%C3%A5s+stad+skola/87178aaf",
        transform: body => {
            return cheerio.load(body);
        }
    };

    return rp(options)
        .then(($) => {
            let selector = `*[js-date="${args.date}"]`;
            return $(selector).parent().parent().siblings().children().children().children().text()
        })
        .catch((err) => {
            console.log(err)
        });
};

let matkristiansborg = () => {
    return "Fisk";
};

const resolvers = {
    Query: {
        matblasbo: matblasboFunktion,
        matkristiansborg: matkristiansborg,
        temp: temp
    }
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});


const app = express();
app.use(cors());
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));

app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

app.listen(3001, () => {
    console.log('Go to http://localhost:3001/graphiql to run queries!');
});