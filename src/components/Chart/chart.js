import {
  select, axisBottom, axisLeft, format, pie, arc, area,
  scaleLinear, scaleBand, scaleOrdinal, max, ascending,
  curveNatural, axisTop, descending
} from 'd3'

// local
import DropDown from '../Dropdown/dropDown'
import { CLASSES as C, CONFIG, EXPERIENCE, FILTERS, REGIONS } from '../../globals/constants'
import { getBarData, getPercentData, getAreaData } from '../../globals/helpers'

import './style.scss';


export default class Chart {

  constructor(data) {
    this.data = data
    this.selection = select("#chart")

    // filters
    this.region = Object.keys(REGIONS)[0]
    this.gender = "Female"
    this.education = "B.A."
    this.experience = Object.keys(EXPERIENCE)[0]

  }

  init() {
    // add title
    this.selection
      .append("h1")
      .html("What is your pay gap?")

    // add dropdowns
    const dropdownContainer = this.selection
      .append("nav")
      .attr("class", "dropdown-container")
    // region dropdown
    this.regionWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")


    // gender dropdown
    this.genderWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")


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


    this.grid = this.selection
      .append("div")
      .attr("class", "grid")

    this.barSvg = this.grid
      .append("div")
      .attr("class", "bars")
      .append("svg")
      .attr("width", CONFIG.WIDTH)
      .attr("height", CONFIG.HEIGHT)

    this.percentSvg = this.grid
      .append("div")
      .attr("class", "percent-container")
      .append("svg")
      .attr("width", CONFIG.WIDTH)
      .attr("height", CONFIG.HEIGHT)

    this.donutSvg = this.grid
      .append("div")
      .attr("class", "donut-container")
      .append("svg")
      .attr("width", CONFIG.WIDTH)
      .attr("height", CONFIG.HEIGHT)

    this.areaSvg = this.grid
      .append("div")
      .attr("class", "area-container")
      .append("svg")
      .attr("width", CONFIG.WIDTH)
      .attr("height", CONFIG.HEIGHT)


    this.draw()

  }

  draw() {

    // update data
    this.barData = getBarData(this.data, this.region, this.experience)
    this.drawBars()
    this.drawPercent()
    this.drawDonut()
    this.drawArea()
    this.drawDropdowns()

  }

  drawDropdowns() {
    new DropDown(this.regionWrapper,
      Object.keys(REGIONS),
      this.region,
      d => this.handleFilter(d, FILTERS.REGION));

    new DropDown(this.genderWrapper,
      ["Female", "Male", "Self-described"],
      this.gender,
      d => this.handleFilter(d, FILTERS.GENDER));

    new DropDown(this.experienceWrapper,
      Object.keys(EXPERIENCE),
      this.experience,
      d => this.handleFilter(d, FILTERS.EXPERIENCE));
  }

  drawArea() {
    const areaData = getAreaData(this.barData)
    const loss = !areaData.find(([_, y]) => y < 0)
    const mappedAreaData = areaData.map(([x, y]) => (y < 0 ? [x, -y] : [x, y]))
    const yDomain = [0, max(mappedAreaData.map(([_, dollars]) => dollars))]
    const yRange = loss ? [CONFIG.MARGIN.y, CONFIG.HEIGHT - CONFIG.MARGIN.y] : [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y]
    const xLine = scaleLinear([0, 30], [CONFIG.MARGIN.x, CONFIG.WIDTH - CONFIG.MARGIN.x])
    const yLine = scaleLinear(yDomain, yRange)
    const xAxisLine = loss ? axisTop(xLine).ticks(8).tickSizeOuter(0) : axisBottom(xLine).ticks(8).tickSizeOuter(0)
    const yAxisLine = axisLeft(yLine).ticks(10).tickFormat(format("$~s")).tickSizeOuter(0)

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
      .attr('transform', `translate(${CONFIG.WIDTH / 2}, ${CONFIG.HEIGHT})`)
      .text('# Years')

    // Y-Axis
    svg
      .selectAll(`g.${C.Y}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.Y}-${C.AXIS}`)
      .attr('transform', `translate(${CONFIG.MARGIN.x}, 0)`)
      .transition()
      .call(yAxisLine)

    svg
      .selectAll(`text.${C.Y}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.Y}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(0, ${CONFIG.HEIGHT / 2})rotate(-90)`)
      .attr("text-anchor", "middle")
      .text('TOTAL')

    const areaGenerator =
      area()
        .curve(curveNatural)
        .x(([x]) => xLine(x))
        .y0(yLine(0))
        .y1(([_, y]) => yLine(y))
    svg
      .selectAll('path.wealth-gap')
      .data([mappedAreaData])
      .join('path')
      .attr('class', 'wealth-gap')
      .attr("d", areaGenerator)
  }

  drawDonut() {
    const colorScale = scaleOrdinal(["total_days", "worked_days"], ["#f2f2f2", CONFIG.COLOR_RANGE[1]])
    const gapData = getPercentData(this.barData)
    const donutData = [{ type: "worked_days", value: 262 + gapData * 262 }]
    let overflowData = [];
    if (gapData > 0) {
      overflowData = [{ type: "worked_days", value: gapData * 262 }, { type: "total_days", value: 262 - gapData * 262 }]
    } else {
      donutData.push({ type: "total_days", value: -gapData * 262 })
      overflowData = []
    }

    const pieGen =
      pie()
        // An accessor to tell the pie where to find the data values
        .value((d) => d.value)
        .sortValues(gapData < 0 ? descending : ascending)

    const arcGen = (donutRadius) =>
      arc()
        .innerRadius(donutRadius)
        .outerRadius(donutRadius - 14)

    const svg = this.donutSvg

    svg
      .selectAll("g.donuts_inner")
      .data([overflowData])
      .join("g")
      .attr("class", "donuts_inner")
      .attr(
        "transform",
        `translate(${CONFIG.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.inner_donut")
          .data((d) => pieGen(d))
          .join("path")
          .attr("class", "inner_donut")
          .style("stroke", (d, i) => {
            return colorScale(d.data.type)
          })
          // .style("stroke-width", 0.7)
          .style("fill", (d, i) => colorScale(d.data.type))
          // .transition()
          .attr("d", d => arcGen(80)(d))
      )

    const donutGroup = svg
      .selectAll("g.donuts")
      .data([donutData])
      .join("g")
      .attr("class", "donuts")
      .attr(
        "transform",
        `translate(${CONFIG.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.outer_donut")
          .data((d) => pieGen(d))
          .join("path")
          .attr("class", "outer_donut")
          .style("stroke", (d, i) => {
            return colorScale(d.data.type)
          })
          // .style("stroke-width", 0.7)
          .style("fill", (d, i) => colorScale(d.data.type))
          // .transition()
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
        // .transition()
        // .duration(500)
        // .attr("opacity", 0)
      )
  }

  drawPercent() {
    const gapData = getPercentData(this.barData)
    const svg = this.percentSvg
    svg
      .selectAll(`text.${C.PCT}`)
      .data([gapData])
      .join("text")
      .attr("class", `${C.PCT}`)
      .attr("transform", `translate(${CONFIG.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`)
      .html((d) => `${(1 - d).toFixed(2)} cents on the dollar`);
  }

  drawBars() {

    const barData = this.barData
    const yScale = scaleLinear([0, max(barData.map(([_, { avg_pay_high }]) => avg_pay_high))], [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y])
    const xScale = scaleBand(["Female", "Male", "Self-described"], [CONFIG.MARGIN.x, CONFIG.WIDTH - CONFIG.MARGIN.x]).padding(.05)
    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisLeft(yScale).tickFormat(format("$~s")).tickSizeOuter(0)
    const colorScale = scaleOrdinal(["Female", "Male", "Self-described"], CONFIG.COLOR_RANGE)
    const svg = this.barSvg

    svg
      .selectAll(`g.${C.X}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.X}-${C.AXIS}`)
      .attr('transform', `translate(${0}, ${CONFIG.HEIGHT - CONFIG.MARGIN.y})`)
      .transition()
      .call(xAxis)

    // X - axis label
    svg
      .selectAll(`text.${C.X}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.X}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(${CONFIG.WIDTH / 2}, ${CONFIG.HEIGHT})`)
      .text('GENDER')

    // Y-Axis
    svg
      .selectAll(`g.${C.Y}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.Y}-${C.AXIS}`)
      .attr('transform', `translate(${CONFIG.MARGIN.x}, 0)`)
      .transition()
      .call(yAxis)

    svg
      .selectAll(`text.${C.Y}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.Y}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(${20}, ${CONFIG.HEIGHT / 2})rotate(-90)`)
      .text('YEARLY PAY')

    svg
      .selectAll(`g.${C.BAR}`)
      .data(barData)
      .join("g")
      .attr("class", `${C.BAR}`)
      .attr("transform", ([gender]) => `translate(${xScale(gender)}, ${0})`)
      .selectAll(`rect.${C.BAR}`)
      .data((d) => [d])
      .join("rect")
      .attr("class", `${C.BAR}`)
      .attr("width", xScale.bandwidth())
      .attr("fill", ([gender]) => colorScale(gender))
      .attr("y", ([, { avg_pay_low }]) => yScale(avg_pay_low))
      .attr(
        "height",
        ([_, { avg_pay_low }]) => CONFIG.HEIGHT - CONFIG.MARGIN.y - yScale(avg_pay_low)
      );

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