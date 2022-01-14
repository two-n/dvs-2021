import { promises as fs } from 'fs';
import { csvParse } from 'd3';

Promise.all([
  fs.readFile('./data/UM_Chessboard_Data.csv', 'utf8'),
])
  .then((data) => data.map((d) => csvParse(d, formatData)))
  .then((data) => fs.writeFile('./data/formattedData.json', JSON.stringify(...data)))
  .then(() => console.log('success'));

function formatData({ name, x_vals, z_vals, y_vals, year }) {
  return [
    { name, x_vals: +x_vals, y_vals: +y_vals, z_vals: +z_vals, year: year.toLowerCase().split(" ")[0] }
  ]
}
