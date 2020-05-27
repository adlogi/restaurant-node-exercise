#!/usr/bin/env node

import yargs from 'yargs';
import { readCSVFile, findOpenRestaurants, print } from '../find-open-restaurants.mjs';

const options = yargs
  .usage('Usage: $0 -c <CSV file> [-D <date>][-d <day> -t <time>][-l]')
  .option('csv', {
    alias: 'c',
    describe: 'Path to CSV file',
    type: 'string',
    demandOption: true
  })
  .option('date', {
    alias: 'D',
    describe: 'Reservation date and time in ISO format (e.g. 2020-05-23T01:35:00)',
    type: 'string',
  })
  .option('day', {
    alias: 'd',
    describe: 'Reservation day of week (e.g. Sat)',
    type: 'string',
  })
  .option('time', {
    alias: 't',
    describe: 'Reservation time in 24-hour hh:mm format (e.g. 17:30)',
    type: 'string',
  })
  .option('list', {
    alias: 'l',
    describe: 'List daily working hours for all restaurants',
    type: 'boolean',
  })
  .check((argv, options) => {
    if ((argv.d && argv.t) || argv.D || argv.l) {
      return true;
    } else {
      throw new Error('Missing arguments.');
    }
  })
  .argv;

// const csv = readCSVFile('./rest_hours.csv');
// const dateTime = new Date('2020-05-23T01:35:00');
const csv = readCSVFile(options.csv);
if (options.list) {
  print(csv);
  console.log('---------------------------------------------------------------------------------------------------------------------------');
}
if ((options.day && options.time) || options.date) {
  const dateTime = new Date(options.date);
  const openRestaurants = findOpenRestaurants(csv, dateTime, options.day, options.time);
  console.log(`Found ${openRestaurants.length} open restaurant(s):`);
  openRestaurants.forEach(r => {
    console.log('  - ' + r);
  });
}

