import { readCSVFile, findOpenRestaurants, print } from './find-open-restaurants.mjs';

const csvFile = './rest_hours.csv';
const csv = readCSVFile(csvFile);
const dateTime = new Date('2020-05-25T04:00:00');
print(csv);
const openRestaurants = findOpenRestaurants(csv, dateTime);
console.log(openRestaurants)
