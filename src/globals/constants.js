
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
  MARGIN: { x: 80, y: 40 },
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
const GENDERS = ["All Genders", "Female", "Male", "Self-described"]

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

export { CLASSES, CONFIG, REGIONS, EXPERIENCE, GENDERS, FILTERS, TOGGLE_VALS, TEXT }