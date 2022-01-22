
import { group, rollups, sum, max, range, timeFormat, format } from 'd3'
import { EXPERIENCE, REGIONS, PAY_KEYS } from './constants'

const getBarData = (data, currentRegion, yearsDVExp, currentGender) => {
  const people = data.filter(
    ({
      Loc1Country,
      EducLevel,
      YearsDVExperience,
      YearsWorkExperience,
      Gender_summarized,
      PayAnnual,
      ...d
    }) =>
      PayAnnual && PayAnnual !== "I am not compensated on a yearly basis" &&
      (currentRegion === "All Regions" || REGIONS[currentRegion].includes(Loc1Country)) &&
      (yearsDVExp === "Any" || EXPERIENCE[yearsDVExp].includes(YearsDVExperience)) &&
      (currentGender === "All" || currentGender === Gender_summarized)
  )

  const genders = currentGender === "All" ? [["All", people]] : [...group(people, (d) => d.Gender_summarized).entries()]
  const distribution = genders.map(
    ([k, v]) => [
      k,
      rollups(
        v,
        (c) => c.length,
        (d) => d.PayAnnual
      )
    ]
  )

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

  return [payAverages, people]
}

const getPercentData = (data) => {
  const gap = data[1][1].avg_pay_high - data[0][1].avg_pay_high
  const gapPercent = gap /
    max(data.flatMap(([k, { avg_pay_high }]) => avg_pay_high))

  return [gap, gapPercent]
}
const getAreaData = (data) => {
  const gap = data[1][1].avg_pay_high - data[0][1].avg_pay_high
  const growth = [...range(1, 31)].reduce((t, v) => ({
    ...t,
    [v]: t[v - 1] ? t[v - 1] * 1.0829 : gap
  }), {})

  const wealth_sum = growth[30]
  const lineData = Object.entries(growth).map(([num, dollars]) => [+num, dollars])
  return [lineData, wealth_sum, growth]
}

const FORMATTERS = {
  date: timeFormat("%B %_d"),
  dollar: format("($,.0f"),
  num: format("(,.0f"),
  thou: format("$~s")
}

export { getBarData, getPercentData, getAreaData, FORMATTERS }