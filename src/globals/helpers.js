
import { group, rollups, sum, max, range } from 'd3'
import { EXPERIENCE, REGIONS } from './constants'

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
      (currentGender === "All Genders" || currentGender === Gender_summarized)
  )

  const genders = currentGender === "All Genders" ? [["All Genders", people]] : [...group(people, (d) => d.Gender_summarized).entries()]
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
            (d) =>
              +d[0]?.split("-")[0].substring(1).trim().replace(/,/, "") * d[1]
          )
        ),
        total_pay_high: sum(
          data.map(
            (d) =>
              +d[0]?.split("-")[1]?.trim().substring(1).replace(/,/, "") * d[1]
          )
        ),
        total_num: sum(data.map((d) => d[1])),
        avg_pay_low:
          sum(
            data.map(
              (d) =>
                +d[0]?.split("-")[0].substring(1).trim().replace(/,/, "") * d[1]
            )
          ) / sum(data.map((d) => d[1])),
        avg_pay_high:
          sum(
            data.map(
              (d) =>
                +d[0]?.split("-")[1]?.trim().substring(1).replace(/,/, "") * d[1]
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

  const wealth_sum = sum(Object.values(growth))
  const lineData = Object.entries(growth).map(([num, dollars]) => [+num, dollars])
  return [lineData, wealth_sum]
}

export { getBarData, getPercentData, getAreaData }