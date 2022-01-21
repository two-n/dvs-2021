import {
  select, axisBottom, axisLeft, format, pie, arc, area,
  scaleLinear, scaleBand, scaleOrdinal, max, ascending,
  curveNatural, axisTop, descending, timeFormat, curveBasis, curveCardinal
} from 'd3'

// local
import DropDown from '../Dropdown/dropDown'
import Toggle from '../Toggle/toggle'
import { CLASSES as C, CONFIG, EXPERIENCE, FILTERS, REGIONS, TOGGLE_VALS, TEXT, GENDERS } from '../../globals/constants'
import { getBarData, getPercentData, getAreaData } from '../../globals/helpers'

import './style.scss';


export default class Chart {

  constructor(data) {
    this.data = data
    this.selection = select("#chart")

    // filters
    this.region = Object.keys(REGIONS)[0]
    this.gender = GENDERS[0]
    this.education = "B.A."
    this.experience = Object.keys(EXPERIENCE)[0]
    this.salary = 30000
    this.toggleVal = TOGGLE_VALS[0]

  }

  init() {

    // setup toggle
    this.toggleWrapper = this.selection
      .append('div')
      .attr('class', `${C.TOGGLE}-${C.WRAPPER}`)

    this.toggle = new Toggle(this.toggleWrapper,
      TOGGLE_VALS,
      this.toggleVal.val,
      (d) => {
        this.toggleVal = TOGGLE_VALS.find(({ val }) => val === d)
        this.selection.classed("color", d)
        this.draw()
      });
    // add title
    this.selection
      .append("h1")
      .html("How Does your Salary Compare?")

    this.selection
      .append("div")
      .attr("class", "intro")
      .html(TEXT.INTRO)

    this.selection
      .append("div")
      .attr("class", "input-label")
      .html("Enter your yearly income")

    const inputContainer = this.selection
      .append("div")
      .attr("class", "input-container")


    inputContainer
      .append("input")
      .attr("value", this.salary)
      .attr("type", "number")
      .on("change", (e) => {
        e.stopPropagation();
        this.salary = +e.target.value.trim().replace(/,/, "")
        if (typeof this.salary === "number") this.draw()
      });

    inputContainer
      .append("button")
      .html("→")

    // add dropdowns
    const dropdownContainer = this.selection
      .append("nav")
      .attr("class", "dropdown-container")
    // gender dropdown
    dropdownContainer
      .append("div")
      .attr("class", "filter-label")
      .html("Compare me to")
    this.genderWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")
    dropdownContainer
      .append("div")
      .attr("class", "filter-label")
      .html("data visualization practitioners in")
    // region dropdown
    this.regionWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")

    dropdownContainer
      .append("div")
      .attr("class", "filter-label")
      .html("with")
    // education dropdown
    // const educationWrapper = dropdownContainer
    //   .append("div")
    //   .attr("class", "filter-wrapper")
    // new DropDown(educationWrapper,
    //   ["B.A.", "M.A.", "PhD"],
    //   this.education,
    //   this.handleFilter);

    // experience dropdown
    this.experienceWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")
    // dropdownContainer
    //   .append("div")
    //   .attr("class", "filter-label")
    //   .html("years experience")
    dropdownContainer
      .append("div")
      .attr("class", "filter-label")
      .html("years of experience")

    this.grid = this.selection
      .append("div")
      .attr("class", "grid")

    this.barText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    this.barGroup = this.grid
      .append("div")
      .attr("class", "bar-container")

    this.barSvg =
      this.barGroup.append("svg")
        .attr("width", function () {
          return select(this.parentNode).style('width')
        })
        .attr("height", CONFIG.HEIGHT)

    this.percentText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    this.percentGroup = this.grid
      .append("div")
      .attr("class", "percent-container")

    this.percentDiv = this.percentGroup
      .append("div")

    this.donutText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    this.donutGroup = this.grid
      .append("div")
      .attr("class", "donut-container")

    this.donutSvg =
      this.donutGroup
        .append("svg")
        .attr("width", function () {
          return select(this.parentNode).style('width')
        }).attr("height", CONFIG.HEIGHT)


    this.areaText = this.grid
      .append("div")
      .attr("class", "text-wrapper")


    this.areaGroup = this.grid
      .append("div")
      .attr("class", "area-container")

    this.areaSvg = this.areaGroup
      .append("svg")
      .attr("width", function () {
        return select(this.parentNode).style('width')
      })
      .attr("height", CONFIG.HEIGHT)

    this.empty = this.selection
      .append("div")
      .attr("class", "empty")
      .html(TEXT.EMPTY)

    const footer = this.selection
      .append("div")
    // .attr("class", "footer")

    footer.append("div")
      .html("link to survey")

    this.WIDTH = select('.bar-container').node().getBoundingClientRect().width

    this.draw()


  }

  draw() {
    const [averages, count] = getBarData(this.data, this.region, this.experience, this.gender)
    this.count = count.length
    // update data
    this.grid.classed("hidden", !averages.length)
    this.empty.classed("hidden", averages.length)
    if (averages.length) {
      this.barData = [['You', { avg_pay_high: this.salary }], ...averages]
      this.drawBars()
      this.drawPercent()
      this.drawDonut()
      this.drawArea()
    }
    this.drawDropdowns()

  }

  drawDropdowns() {
    new DropDown(this.regionWrapper,
      Object.keys(REGIONS),
      this.region,
      d => this.handleFilter(d, FILTERS.REGION));

    new DropDown(this.genderWrapper,
      GENDERS,
      this.gender,
      d => this.handleFilter(d, FILTERS.GENDER));

    new DropDown(this.experienceWrapper,
      Object.keys(EXPERIENCE),
      this.experience,
      d => this.handleFilter(d, FILTERS.EXPERIENCE), false);
  }

  drawArea() {
    const [areaData, wealth_sum] = getAreaData(this.barData)
    const [gap, gapData] = getPercentData(this.barData)
    const loss = !areaData.find(([_, y]) => y < 0)
    const mappedAreaData = areaData.map(([x, y]) => (y < 0 ? [x, -y] : [x, y]))
    const yDomain = [0, max(mappedAreaData.map(([_, dollars]) => dollars))]
    const yRange = loss ? [CONFIG.MARGIN.y, CONFIG.HEIGHT - CONFIG.MARGIN.y] : [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y]
    const xLine = scaleLinear([0, 30], [CONFIG.MARGIN.x, this.WIDTH - CONFIG.MARGIN.x])
    const yLine = scaleLinear(yDomain, yRange)
    const xAxisLine = loss ? axisTop(xLine).ticks(5).tickSizeOuter(0) : axisBottom(xLine).ticks(8).tickSizeOuter(0).tickPadding(14)
    const yAxisLine = axisLeft(yLine).ticks(5).tickFormat(format("$~s")).tickSizeOuter(0)

    this.areaText
      .html(`Your pay gap of <strong>${format("($,.0f")(Math.abs(gap))}</strong> could accumulate
        to a <strong>${wealth_sum > 0 ? 'loss' : 'gain'}
        of ${format("($,.0f")(Math.abs(wealth_sum))}</strong> in wealth over 30 years,
        assuming you invest that amount today in an index fund tracking the S&P 500.
        This is assuming an inflation adjusted return of 8.29% year over year,
        as is the historical return of the S&P 500.`)

    const svg = this.areaSvg

    // X-Axis
    svg
      .selectAll(`g.${C.X}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.X}-${C.AXIS}`)
      .attr('transform', `translate(${0}, ${loss ? CONFIG.MARGIN.y : CONFIG.HEIGHT - CONFIG.MARGIN.y})`)
      .transition()
      .call(xAxisLine)

    // X - axis label
    svg
      .selectAll(`text.${C.X}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.X}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT})`)
      .text('Years')

    // Y-Axis
    svg
      .selectAll(`g.${C.Y}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.Y}-${C.AXIS}`)
      .attr('transform', `translate(${CONFIG.MARGIN.x}, 0)`)
      .transition()
      .call(yAxisLine)

    const areaGenerator =
      area()
        .x(([x]) => xLine(x))
        .y0(yLine(0))
        .y1(([_, y]) => yLine(y))
    svg
      .selectAll('path.wealth-gap')
      .data([mappedAreaData])
      .join('path')
      .attr('class', 'wealth-gap')
      .transition()
      .attr("fill", CONFIG.COLOR_RANGE[this.toggleVal.text][0])
      .attr("d", areaGenerator)
  }

  drawDonut() {
    const colorScale = scaleOrdinal(["total_days", "worked_days"], ["#f2f2f2", CONFIG.COLOR_RANGE[this.toggleVal.text][1]])
    const [gap, gapData] = getPercentData(this.barData)
    const days = 365 * gapData
    const new_year = new Date("1/1/2021")
    const date = timeFormat("%B %_d")(new Date().setDate(new_year.getDate() + days))

    const donutData = [{ type: "worked_days", value: 262 + gapData * 262 }]
    let overflowData = [];
    if (gapData > 0) {
      overflowData = [{ type: "worked_days", value: gapData * 262 }, { type: "total_days", value: 262 - gapData * 262 }]
    } else {
      donutData.push({ type: "total_days", value: -gapData * 262 })
      overflowData = []
    }

    this.donutText
      .html(`and you work
      <strong>${format("(,.0f")(Math.abs(262 * gapData))} days </strong>
      ${gapData > 0 ? 'more' : 'less'}
      than the average respondant to earn the same amount.
      In other words, you
      ${gapData > 0 ? 'would work for free until' : 'could stop working on'}
      <strong>${date}.</strong>`)

    const labelGen =
      pie()
        // An accessor to tell the pie where to find the data values
        .value((d) => d.value)

    const pieGen =
      pie()
        // An accessor to tell the pie where to find the data values
        .value((d) => d.value)
        .sort((a, b) => descending(a.type, b.type))

    const arcGen = (donutRadius) =>
      arc()
        .innerRadius(donutRadius)
        .outerRadius(donutRadius - 14)
        .cornerRadius(10);

    const svg = this.donutSvg

    svg
      .selectAll("g.donuts_inner")
      .data([overflowData])
      .join("g")
      .attr("class", "donuts_inner")
      .attr(
        "transform",
        `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.inner_donut")
          .data((d) => pieGen(d))
          .join("path")
          .style("fill", (d, i) => colorScale(d.data.type))
          .attr("class", "inner_donut")
          .transition()
          .attr("d", d => arcGen(80)(d))
      )

    const labelData =
      ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        .map((d) => ({ type: d, value: 1 }))
    svg
      .selectAll("g.label-donut")
      .data([labelData])
      .join("g")
      .attr("class", "label-donut")
      .attr(
        "transform",
        `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("text.label-donut")
          .data((d) => labelGen(d))
          .join("text")
          .attr("class", "label-donut")
          .attr('transform', (d, i) => `translate(${arcGen(140).centroid(d)})`)
          .attr('text-anchor', 'middle')
          .text(({ data }) => data.type)

      )


    const donutGroup = svg
      .selectAll("g.donuts")
      .data([donutData])
      .join("g")
      .attr("class", "donuts")
      .attr(
        "transform",
        `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.outer_donut")
          .data((d) => pieGen(d))
          .join("path")
          .attr("class", "outer_donut")
          .style("fill", (d, i) => colorScale(d.data.type))
          .transition()
          .attr("d", d => arcGen(100)(d))
      )

      .call((g) =>
        g
          .selectAll("text.donut")
          .data((d) => d)
          .join("text")
          .attr("class", "donut")
          .style("stroke", "black")
          .text(({ type, value }) => type === "worked_days" ? (262 - value > 0 ? "-" : "+") + (Math.abs(262 - value)).toFixed(2) + " days" : "")
          .attr("dy", "0.25em")
      )

  }

  drawPercent() {
    const [gap, gapData] = getPercentData(this.barData)
    this.percentText
      .html("which means you earn")


    this.percentDiv
      .selectAll(`.${C.PCT}`)
      .data([gapData])
      .join("div")
      .attr("class", `${C.PCT}`)
      .attr("transform", `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`)
      .html((d) => `<div> ${(100 - d * 100).toFixed(0)} ¢</div>
  <div class="pct-label">on the dollar</div>`);
  }

  drawBars() {

    const barData = this.barData
    const yScale = scaleLinear([0, max(barData.map(([_, { avg_pay_high }]) => avg_pay_high))], [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y])
    const xScale = scaleBand(["You", this.gender], [CONFIG.MARGIN.x, this.WIDTH - CONFIG.MARGIN.x]).padding(.05)
    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisLeft(yScale).ticks(5).tickFormat(format("$~s")).tickSizeOuter(0)
    const colorScale = scaleOrdinal(["You", this.gender], CONFIG.COLOR_RANGE[this.toggleVal.text])
    const [gap] = getPercentData(barData)

    this.barText
      .html(`<span>You earn</span >
    <strong>${format("($,.0f")(Math.abs(gap))}
    ${gap > 0 ? 'less' : 'more'}</strong>
    <span>than average salaries of the <strong>${this.count}</strong>
    survey respondants who met your filter criteria. </span>`)

    const svg = this.barSvg

    svg
      .selectAll(`g.${C.X}-${C.AXIS} `)
      .data([0])
      .join('g')
      .attr('class', `${C.X}-${C.AXIS} `)
      .attr('transform', `translate(${0}, ${CONFIG.HEIGHT - CONFIG.MARGIN.y})`)
      .transition()
      .call(xAxis)

    // X - axis label
    svg
      .selectAll(`text.${C.X}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.X}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT})`)
      .text('Gender')

    // Y-Axis
    svg
      .selectAll(`g.${C.Y}-${C.AXIS} `)
      .data([0])
      .join('g')
      .attr('class', `${C.Y}-${C.AXIS} `)
      .attr('transform', `translate(${CONFIG.MARGIN.x}, 0)`)
      .transition()
      .call(yAxis)

    svg
      .selectAll(`text.${C.Y}-${C.AXIS}-${C.LABEL} `)
      .data([0])
      .join('text')
      .attr('class', `${C.Y}-${C.AXIS}-${C.LABEL} `)
      .attr('transform', `translate(${20}, ${CONFIG.HEIGHT / 2})rotate(-90)`)
      .text('Yearly Pay')

    svg
      .selectAll(`g.${C.BAR} `)
      .data(barData)
      .join("g")
      .attr("class", `${C.BAR} `)
      .attr("transform", ([gender]) => `translate(${xScale(gender)}, ${0})`
      )
      .selectAll(`rect.${C.BAR} `)
      .data((d) => [d])
      .join("rect")
      .attr("class", `${C.BAR} `)
      .attr("rx", 5)
      .attr("width", xScale.bandwidth())
      .transition()
      .attr("y", ([, { avg_pay_high }]) => yScale(avg_pay_high))
      .attr(
        "height",
        ([_, { avg_pay_high }]) => CONFIG.HEIGHT - CONFIG.MARGIN.y - yScale(avg_pay_high)
      )
      .transition()
      .attr("fill", ([gender]) => colorScale(gender))

  }

  handleFilter = (selectedOption, filter) => {

    switch (filter) {
      case FILTERS.REGION:
        // reset control classmember variable
        this.region = selectedOption;
        break;
      case FILTERS.GENDER:
        this.gender = selectedOption;
        break;
      case FILTERS.EXPERIENCE:
        this.experience = selectedOption
        break;
      default:
        break;
    }

    // draw chart again to transition
    this.draw()
  }
}