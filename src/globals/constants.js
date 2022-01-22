
const CLASSES = {
  FILTER: 'filter',
  OPEN: 'open',
  OPTION: 'option',
  SELECTED: 'selected',
  X: "x",
  Y: "y",
  AXIS: "axis",
  LABEL: "label",
  BAR: 'bar',
  PCT: 'pct',
  TOGGLE: 'toggle',
  WRAPPER: 'wrapper'
}

const CONFIG = {
  HEIGHT: 300,
  WIDTH: 400,
  MARGIN: { left: 80, right: 40, y: 40 },
  COLOR_RANGE: {
    gray: ["#929292", "#464646"], color: ["#2CB1A5",
      "#A05E9C"]
  }
}

const FILTERS = {
  REGION: "region",
  GENDER: "gender",
  EDUCATION: 'education',
  EXPERIENCE: 'experience'
}

const TOGGLE_VALS = [{ text: "color", val: false }, { text: "gray", val: true }]

const REGIONS = {
  "All Regions": "All",
  "Africa": ["Uganda", "South Africa", "Nigeria", "South Sudan", "Rwanda", "Zambia", "Egypt", "Kenya", "Ghana", "Tanzania", "Sudan", "Morocco"],
  "Australia & Oceania": ["Australia", "New Zealand"],
  "Asia": ["China", "India", "Thailand", "Singapore", "Taiwan", "Kazakhstan", "Vietnam", "Philippines", "Japan", "Nepal", "Sri Lanka", "Bangladesh", "Indonesia", "Malaysia", "Pakistan"],

  Europe: ["Russia", "United Kingdom", "Germany", "Switzerland", "Sweden", "Netherlands", "Ireland", "Italy", "Spain", "France", "Finland", "Lithuania", "Hungary", "Portugal", "Albania", "Poland", "Czech Republic (Czechia)", "Slovenia", "Bulgaria", "Greece", "Denmark", "Belgium", "Croatia", "Austria", "Cyprus", "Romania", "North Macedonia", "Georgia", "Luxembourg", "Norway", "Ukraine", "Armenia", "Belarus", "Serbia", "Iceland"
    , "Turkey"],
  "Latin America": ["Mexico", "Brazil", "Chile", "Colombia", "Peru", "Ecuador", "Argentina", "Guatemala", "Paraguay", "Trinidad and Tobago", "Dominican Republic"],
  "Middle East": ["Israel", "Afghanistan", "United Arab Emirates", "Iran"],
  "US & Canada": ["United States", "Canada"],

}

const EXPERIENCE = { "Any": "All", "2 or less": ["Less than 1 year", "1", "2"], "3-5": ["3", "4", "5"], "6-10": ["6–10"], "11 or more": ["11–15", "16–20", "21–25", "26–30", "More than 30"] }
const GENDERS = ["All", "Female", "Male", "Self-described"]
const TEXT = {
  INTRO: `The tool below allows you to compare your yearly income to the incomes of those who
  participated in the <a href="https://www.datavisualizationsociety.org/" target=_blank>Data Visualization Society's</a> 'State of the Data Visualization Industry' 2021 Survey.
  In total, 2165 survey responses were collected. Of those 2165 respondants, 1539 provided a yearly income.
  These incomes were provided in a range. In order to calculate the average incomes, I took the higher end
  of those salary ranges and averaged them across the 1539 respondants. The tool below allows you to further
  filter these responses by the respondant's gender, region, and level of experience. Enter your yearly income
  below to see how you compare to the survey respondants.`,
  EMPTY: "Sorry, there is no data for your selected filters."
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

const PAY_KEYS = {
  '$10,000 - $19,999': { low: 10000, high: 19999 },
  '$80,000 - $99,999': { low: 80000, high: 99999 },
  '$100,000 - $119,999': { low: 100000, high: 119999 },
  '$40,000 - $59,999': { low: 40000, high: 59999 },
  '$180,000 - $199,999': { low: 180000, high: 199999 },
  '$140,000 - $159,999': { low: 140000, high: 159999 },
  '$60,000 - $79,999': { low: 60000, high: 79999 },
  '$120,000 - $139,999': { low: 120000, high: 139999 },
  'Less than $10,000': { low: 0, high: 10000 },
  '$20,000 - $39,999': { low: 20000, high: 39999 },
  '$220,000 - $239,999': { low: 220000, high: 239999 },
  '$200,000 - $219,999': { low: 200000, high: 219999 },
  '$160,000 - $179,999': { low: 160000, high: 179999 },
  '$240,000 or more': { low: 240000, high: 240000 },
}

export { CLASSES, CONFIG, REGIONS, EXPERIENCE, GENDERS, FILTERS, TOGGLE_VALS, TEXT, MONTHS, PAY_KEYS }