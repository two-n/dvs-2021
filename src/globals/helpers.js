
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
      ...d
    }) =>
      REGIONS[currentRegion].includes(Loc1Country) &&
      EXPERIENCE[yearsDVExp].includes(YearsDVExperience) &&
      currentGender === Gender_summarized
  )


  const distribution = [...group(people, (d) => d.Gender_summarized).entries()].map(
    ([k, v]) => [
      k,

      rollups(
        v,
        (c) => c.length,
        (d) => d.PayAnnual
      )
        .filter(
          ([range, num]) =>
            range && range !== "I am not compensated on a yearly basis"
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

  return payAverages
}

getPercentData = (data) => {
  const gap = data[1][1].avg_pay_high - data[0][1].avg_pay_high
  const gapPercent = gap /
    max(data.flatMap(([k, { avg_pay_high }]) => avg_pay_high))

  return gapPercent
}
const getAreaData = (data) => {
  const gap = data[1][1].avg_pay_high - data[0][1].avg_pay_high

  const growth = [...range(1, 31).keys()].reduce((t, v, i, arr) => ({
    ...t,
    [v]: arr[i - 1] || arr[i - 1] === 0 ? t[i - 1] * 1.105 : gap
  }), {})

  const lineData = Object.entries(growth).map(([num, dollars]) => [+num, dollars])
  return lineData
}

export { getBarData, getPercentData, getAreaData }