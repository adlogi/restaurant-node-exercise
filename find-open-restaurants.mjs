import fs from 'fs';

const daysOfWeek = {
  'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat':5, 'Sun':6
};

/**
 * Read a csv file and return a list of restaurants and their opening hours.
 *
 * @param {string}    fileName    csv file name and path, containing restaurant names with opening hours.
 *
 * @return {Object[]}             List of objects representing restaurants' names and opening hours.
 */
export function readCSVFile(fileName) {
  const textData = fs.readFileSync(fileName, 'utf-8');
  return csvToObj(textData);
}

/**
 * Pass a list of strings containing restaurants' names and opening hours as extracted from a CSV file. Return them as a list of objects. [{name, days[{open{hour, minute}, close{hour, minute}}, ...]}, ...]
 *
 * @param {string[]}  csv         a list of restaurants - each has a name and opening hours.
 *
 * @return {Object[]}             List of objects representing restaurants' names and opening hours.
 */
function csvToObj(csv) {
  const lines = csv.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const restaurant = {};
    restaurant.days = new Array(7);
    // split the current line into <restaurant name> and <opening hours> strings, e.g.:
    // ["Sudachi","Mon-Wed, Sat 5 pm - 12:30 am  / Thu-Fri 5 pm - 1:30 am  / Sun 3 pm - 11:30 pm"]
    const currentLine = lines[i].split(/","|"/).filter(Boolean);
    restaurant.name = currentLine[0];
    if (restaurant.name) {
      // split the opening hours string into distiguished hours, e.g.:
      // ["Mon-Wed 5 pm - 12:30 am", "Thu-Fri, Sat 5 pm - 1:30 am", "Sun 3 pm - 11:30 pm"]
      const times = currentLine[1].split(/\s+\/\s/);
      times.forEach(time => {
        // extract the opening and closing times, e.g.:
        // "Mon-Wed 5 pm - 12:30 am" -> ["5 pm - 12:30 am", "5", undefined, "pm", "12", "30", "pm"]
        const hoursStrings = time.match(/(\d+)(?::(\d+))? ([ap]m) - (\d+)(?::(\d+))? ([ap]m)/);
        // convert time from 12-hour string to 24-hour string
        function convert12to24(hourStr, amPmStr) {
          let hour = parseInt(hourStr);
          if (amPmStr === 'pm' && hour < 12) {
            hour += 12;
          }
          if (amPmStr === 'am' && hour === 12) {
            hour = 0;
          }
          return hour;
        }
        const hours = {
          open: {
            hour: convert12to24(hoursStrings[1], hoursStrings[3]),
            minute: hoursStrings[2] ? parseInt(hoursStrings[2]) : 0,
          },
          close: {
            hour: convert12to24(hoursStrings[4], hoursStrings[6]),
            minute: hoursStrings[5] ? parseInt(hoursStrings[5]) : 0,
          }
        }
        
        // extraxt the days, e.g.
        // "Thu-Fri, Sat 5 pm - 1:30 am"
        const daysStrings = time.match(/([F-W][a-z]{2}-[F-W][a-z]{2})|(?:(?:^|[^-])([F-W][a-z]{2})[ ,])/g);
        daysStrings.forEach(str => {
          // check if multiple days (e.g. "Thu-Fri")
          if (str.length > 5) {
            const [start, end] = str.match(/([F-W][a-z]{2})/g);
            let day = daysOfWeek[start];
            while (day !== daysOfWeek[end]) {
              restaurant.days[day] = hours;
              day = (day + 1) % 7;
            }
            restaurant.days[daysOfWeek[end]] = hours;
          } else {
            const day = daysOfWeek[str.match(/([F-W][a-z]{2})/g)[0]];
            restaurant.days[day] = hours;
          }
        })
      });
      result.push(restaurant);
    }
  }
  return result;
}

/**
 * Pass a list of restaurants extracted from a CSV file and a time and date. Return a list of restaurants open at that time and date. If dayArg:string and timeArg:string are provided, dateTime:Date is ignored.
 *
 * @param {Object[]}  csv         a list of restaurants - each has a name and opening hours.
 * @param {Date}      dateTime    date/time.
 * @param {string}    [dayArg]    Day of week, e.g. Sat.
 * @param {string}    [timeArg]   Time in 24-hour hh-mm format.
 *
 * @return {string[]}             List of restaurants' names open at the specified time.
 */
export function findOpenRestaurants(csv, dateTime, dayArg, timeArg) {
  // ASSUMPTION: arguments are provided in the right format
  let timeStr, day;
  // if dayArg:string and timeArg:string are provided, ignore dateTime:Date
  if (dayArg && timeArg) {
    timeStr = timeArg;
    day = daysOfWeek[dayArg[0].toUpperCase() + dayArg.slice(1).toLowerCase()];
  } else {
    timeStr = dateTime.toLocaleString('en-US', {
      hour: 'numeric', minute: 'numeric', hour12: false
    });
    day = dateTime.getDay() - 1;
  }
  const time = {
    hour: parseInt(timeStr.slice(0, 2)),
    minute: parseInt(timeStr.slice(3))
  };
  // ASSUMPTION: all restaurants close by 5am
  // For times after midnight, check the opening time for the previous day
  if (time.hour < 5) {
    day = (day + 6) % 7;
  }

  const results = [];
  for (const r of csv) {
    if(r.days[day]) {
      // check if between opening time (inclusive) and closing time (exclusive)
      if (isBetween(time, r.days[day].open, r.days[day].close)) {
        results.push(r.name);
      }
    }
  }
  return results;
}

/**
 * Test if a specific time falls between two other times. It's assumed that start and end times are in the right order. Times are objects of the format {hour:number, minute:number}
 *
 * @param {Object}    time        The time to be checked.
 * @param {Object}    start       Start time.
 * @param {Object}    end         End time.
 *
 * @return {boolean}             Whether time falls in the range [start, end[.
 */
function isBetween(time, start, end) {
  return isBefore(start, time, 'eq') && isBefore(time, end);
}

/**
 * Test if a specific time is before another time. Times are objects of the format {hour:number, minute:number}. This function is created with the assumption that all restaurants close by 5am.
 *
 * @param {Object}      start        The first time.
 * @param {Object}      end          The second time
 * @param {string=''}   orEqual      Return true if 'eq' is passed and start is before or equal end.
 *
 * @return {boolean}                 Whether start comes before end (or are the same).
 */
function isBefore(start, end, orEqual = '') {
  const s = Object.assign({}, start);
  const e = Object.assign({}, end);
  // ASSUMPTION: all restaurants close by 5am
  if (s.hour <= 5) {
    s.hour += 24;
  }
  if (e.hour <= 5) {
    e.hour += 24;
  }
  if (s.hour < e.hour) {
    return true;
  }
  if (s.hour === e.hour && orEqual === 'eq' && s.minute <= e.minute) {
    return true;
  }
  if (s.hour === e.hour && orEqual !== 'eq' && s.minute < e.minute) {
    return true;
  }
  return false;
}


/**
 * Print a time table of working hours for all restaurants
 *
 * @param {Object[]}    csv         a list of restaurants - each has a name and opening hours.
 *
 */
export function print(csv) {
  for (const r of csv) {
    console.log(r.name.slice(0, 15).padEnd(15) + '\t' + weekWorkingHours(r))
  }
}

/**
 * Return a string showing the daily working hours during the week
 *
 * @param {Object}        r           a restaurant object
 *
 * @return {string}                   a string combining the daily working hours
 * 
 */

function weekWorkingHours(r) {
  let week = '';
  for (const d of r.days) {
    week += dayWorkingHours(d) + '\t';
  }
  return week;
}

/**
 * Return a string showing the working hours for a given day
 *
 * @param {Object}        csv         a day object with opening and closing hours
 *
 * @return {string}                  a string of the format hh:mm-hh:mm
 * 
 */
function dayWorkingHours(d) {
  if (d) return `${(d.open.hour).toString().padStart(2, '0')}:${(d.open.minute).toString().padStart(2, '0')}-${(d.close.hour).toString().padStart(2, '0')}:${(d.close.minute).toString().padStart(2, '0')}`;
  return '--:--/--:--';
}
