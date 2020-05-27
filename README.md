# Finding Open Restaurants

A package that allows calling `findOpenRestaurants` with a CSV string matching [this format](./rest_hours.csv) and a DateTime object.

Task description: [https://www.notion.so/Full-Stack-Intern-Take-Home-Assignment-e9c88cb378d546efab4341ccea49f0c4](https://www.notion.so/Full-Stack-Intern-Take-Home-Assignment-e9c88cb378d546efab4341ccea49f0c4)

- To see the use of this package in its simplest form, check `app.js`.
- You can also try the CLI client. It accepts a path string pointing to the location of a CSV file on the computer and a date string. For example, it might look like this:

```shell
find-open-restaurants -c rest_hours.csv -D 2025-06-17T08:24:00
```

- The CLI client accepts also a day (e.g. Sat) and time (e.g. 17:30) strings instead of an ISO date string. When these two are provided a date string will be ignored if also provided. For example, it might look like this:

```shell
find-open-restaurants -c rest_hours.csv -d Mon -t 09:00
```

- CLI client usage

```shell
find-open-restaurants --help
Usage: find-open-restaurants -c <CSV file> [-D <date>][-d <day> -t <time>][-l]

Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  --csv, -c   Path to CSV file                               [string] [required]
  --date, -D  Reservation date and time in ISO format (e.g. 2020-05-23T01:35:00)
                                                                        [string]
  --day, -d   Reservation day of week (e.g. Sat)                        [string]
  --time, -t  Reservation time in 24-hour hh:mm format (e.g. 17:30)     [string]
  --list, -l  List daily working hours for all restaurants             [boolean]
```

## Project Structure

- The package is implemented in `find-open-restaurants.mjs`
- `app.js` demonstrates basic use. Run using `node app.js`
- `bin/cli.js` is a CLI client for the package. Install by running `npm install -g .`. Uninstall by running `npm uninstall -g .`

## Project Notes

### Assumptions

- CSV file and date arguments are provided in the right format.
- All restaurants close by 5:00am (that's used for comapring times).
- For times after midnight, opening time of the previous day are checked. E.g. for Sat 01:00 the working hours for Friday are checked.
