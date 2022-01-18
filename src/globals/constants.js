
const CLASSES = {
  FILTER: 'filter',
  OPEN: 'open',
  OPTION: 'option',
  SELECTED: 'selected'
}

const CONFIG = {
  HEIGHT: 300,
  WIDTH: 400,
  MARGIN: { x: 80, y: 40 },
  COLOR_RANGE: ["#929292", "#6c6c6c"]
}

const FILTERS = {
  REGION: "region",
  GENDER: "gender",
  EDUCATION: 'education',
  EXPERIENCE: 'experience'
}

const REGIONS = {
  Europe: ["Russia", "United Kingdom", "Germany", "Switzerland", "Sweden", "Netherlands", "Ireland", "Italy", "Spain", "France", "Finland", "Lithuania", "Hungary", "Portugal", "Albania", "Poland", "Czech Republic (Czechia)", "Slovenia", "Bulgaria", "Greece", "Denmark", "Belgium", "Croatia", "Austria", "Cyprus", "Romania", "North Macedonia", "Georgia", "Luxembourg", "Norway", "Ukraine", "Armenia", "Belarus", "Serbia", "Iceland"
  ],
  "US & Canada": ["United States", "Canada"],
  "Central & South America & Carribean": ["Mexico", "Brazil", "Chile", "Colombia", "Peru", "Ecuador", "Argentina", "Guatemala", "Paraguay", "Trinidad and Tobago", "Dominican Republic"],
  "Australia & Oceania": ["Australia", "New Zealand"],
  "Central, South & East Asia": ["China", "India", "Thailand", "Singapore", "Taiwan", "Kazakhstan", "Vietnam", "Philippines", "Japan", "Nepal", "Sri Lanka", "Bangladesh", "Indonesia", "Malaysia", "Pakistan"],
  "Middle East": ["Israel", "Turkey", "Afghanistan", "United Arab Emirates", "Iran"],
  "Africa": ["Uganda", "South Africa", "Nigeria", "South Sudan", "Rwanda", "Zambia", "Egypt", "Kenya", "Ghana", "Tanzania", "Sudan", "Morocco"]
}

const EXPERIENCE = { "2 or less": ["Less than 1 year", "1", "2"], "3-5": ["3", "4", "5"], "6-10": ["6–10"], "10 or more": ["11–15", "16–20", "21–25", "26–30", "More than 30"] }

export { CLASSES, CONFIG, REGIONS, EXPERIENCE, FILTERS }