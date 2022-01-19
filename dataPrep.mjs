
import { promises as fs } from 'fs';
import { csvParse } from 'd3-dsv';

Promise.all([
  fs.readFile('./data/data_2021_main.csv', 'utf8'),
])
  .then((data) => data.map((d) => csvParse(d, formatData)))
  .then((data) => fs.writeFile('./data/formattedData.json', JSON.stringify(...data)))
  .then(() => console.log('success'));

function formatData({ PayAnnual, Loc1Country, EducLevel, YearsDVExperience, Gender_summarized }) {
  return (
    { PayAnnual, Loc1Country, EducLevel, YearsDVExperience, Gender_summarized }
  )
}
