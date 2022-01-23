
import { group, rollups, sum, range, timeFormat, format } from 'd3'
import { EXPERIENCE, REGIONS, PAY_KEYS } from './constants'

const getBarData = (data, currentRegion, currentExperience, currentGender) => {
  // filter data by filter inputs
  const respondants = data.filter(
    ({
      Loc1Country,
      YearsDVExperience,
      Gender_summarized,
      PayAnnual
    }) =>
      PayAnnual && PayAnnual !== "I am not compensated on a yearly basis" &&
      (currentRegion === "All Regions" || REGIONS[currentRegion].includes(Loc1Country)) &&
      (currentExperience === "Any" || EXPERIENCE[currentExperience].includes(YearsDVExperience)) &&
      (currentGender === "All" || currentGender === Gender_summarized)
  )
  // group by gender or put all data in one group if selected gender is "all"
  const genders = currentGender === "All" ? [["All", respondants]] : [...group(respondants, (d) => d.Gender_summarized).entries()]

  // for each gender, group by pay range and reduce to count
  const distribution = genders.map(
    ([k, v]) => [
      k,
      rollups(
        v,
        (c) => c.length, // get count
        (d) => d.PayAnnual
      )
    ]
  )

  // create nested pay array for selected gender
  /*
  [
    [ "Female",
      {
        total_pay_low: number,
        total_pay_high: number,
        average_pay_low: number,
        average_pay_high: number
      }
    ]
  ]
  */
  const payAverages = distribution.map(([gender, data]) => [
    gender,
    data.reduce(
      (acc, [pay, num]) => ({
        ...acc,
        total_pay_low: sum(
          data.map(
            ([pay, count]) =>
              PAY_KEYS[pay].low * count
          )
        ),
        total_pay_high: sum(
          data.map(
            ([pay, count]) =>
              PAY_KEYS[pay].high * count
          )
        ),
        total_num: sum(data.map((d) => d[1])),
        avg_pay_low:
          sum(
            data.map(
              ([pay, count]) =>
                PAY_KEYS[pay].low * count
            )
          ) / sum(data.map((d) => d[1])),
        avg_pay_high:
          sum(
            data.map(
              ([pay, count]) =>
                PAY_KEYS[pay].high * count
            )
          ) / sum(data.map((d) => d[1])),
        count: data.length
      }),
      {}
    )
  ])

  return [payAverages, respondants]
}

const getPercentData = (data) => {
  // calculate gap between average pay of respondants and user
  const [you, respondants] = data
  const gap = respondants[1].avg_pay_high - you[1].avg_pay_high
  // divide gap by respondants average to get percent
  const gapPercent = gap /
    respondants[1].avg_pay_high

  return [gap, gapPercent]
}
const getAreaData = (gap) => {
  // calculate yearly growth at rate of 8.89% for 30 years
  const growth = [...range(1, 31)].reduce((t, v) => ({
    ...t,
    [v]: t[v - 1] ? t[v - 1] * 1.0829 : gap
  }), {})
  // loss or gain
  const loss = gap > 0;
  // cumulative wealth loss / gain after 30 years
  const wealth_sum = growth[30]
  // build line data in shape [[x, y], [x, y]]
  const lineData = Object.entries(growth).map(([num, dollars]) => [+num, Math.abs(dollars)])
  return [lineData, wealth_sum, growth, loss]
}

const getDonutData = (gapPercent) => {
  // typical number of work days in a year
  const WORK_DAYS = 262
  // days extra worked to add to date
  const days = 365 * gapPercent
  // start counting from Jan 1st of this year
  const new_year = new Date(new Date().getFullYear(), 0, 1)
  const date = FORMATTERS.date(new Date().setDate(new_year.getDate() + days))

  // always fill array for outer donut
  const donutData = [{ type: "worked_days", value: WORK_DAYS + gapPercent * WORK_DAYS }]
  // initialize empty array for inner ("days over") donut
  let overflowData = [];
  // if gap is positive, add data to inner donut "days over" array
  if (gapPercent > 0) {
    overflowData = [{ type: "worked_days", value: gapPercent * WORK_DAYS }, { type: "total_days", value: WORK_DAYS - gapPercent * WORK_DAYS }]
  } else {
    // otherwise push negative total days into outer array to create gap
    donutData.push({ type: "total_days", value: -gapPercent * WORK_DAYS })
    // reset overflow array to empty
    overflowData = []
  }
  return [donutData, overflowData, date]
}

const FORMATTERS = {
  date: timeFormat("%B %_d"),
  dollar: format("($,.0f"),
  num: format("(,.0f"),
  thou: format("$~s")
}

export { getBarData, getPercentData, getAreaData, getDonutData, FORMATTERS }