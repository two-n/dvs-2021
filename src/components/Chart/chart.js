import {
  select, axisBottom, axisLeft, format, pie, arc, area,
  scaleLinear, scaleBand, scaleOrdinal, max, scaleSqrt,
  axisTop, descending, min, pointer, line
} from 'd3'

// local
import DropDown from '../Dropdown/dropDown'
import Toggle from '../Toggle/toggle'
import { CLASSES as C, CONFIG, EXPERIENCE, FILTERS, REGIONS, TOGGLE_VALS, TEXT, GENDERS, MONTHS } from '../../globals/constants'
import { getBarData, getPercentData, getAreaData, getDonutData, FORMATTERS as F } from '../../globals/helpers'

import './style.scss';


export default class Chart {

  constructor(data) {

    // initialize class member variables
    this.data = data
    this.selection = select("#chart")
    this.region = Object.keys(REGIONS)[0]
    this.gender = GENDERS[0]
    this.experience = Object.keys(EXPERIENCE)[0]
    this.salary = 30000
    this.toggleVal = TOGGLE_VALS[0]

  }

  /* Things that only happen once */
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

    // append title
    this.selection
      .append("h1")
      .html("How Does your Income Compare?")

    // append intro text
    this.selection
      .append("div")
      .attr("class", "intro")
      .append("div")
      .html(TEXT.INTRO)

    /* Inputs & Filters */
    // input label
    this.selection
      .append("div")
      .attr("class", "input-label")
      .html("Enter your yearly income")
    const inputContainer = this.selection
      .append("div")
      .attr("class", "input-container")

    // input element
    inputContainer
      .append("input")
      .attr("value", this.salary)
      .attr("type", "number")
      .on("change", (e) => {
        // get income on submit & redraw charts
        e.stopPropagation();
        this.salary = +e.target.value.trim().replace(/,/, "")
        this.draw()
      });

    // button
    inputContainer
      .append("button")
      .html("→")

    /* Append Filters */

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

    // experience dropdown
    this.experienceWrapper = dropdownContainer
      .append("div")
      .attr("class", "filter-wrapper")

    dropdownContainer
      .append("div")
      .attr("class", "filter-label")
      .html("years of experience")

    /* Append Visualization Grid Elements */
    this.grid = this.selection
      .append("div")
      .attr("class", "grid")

    /* Bar chart section */

    // text
    this.barText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    // viz
    this.barGroup = this.grid
      .append("div")
      .attr("class", "bar-container")

    this.barSvg =
      this.barGroup.append("svg")
        // set svg width to width of parent container (grid element)
        .attr("width", this.setWidth)
        .attr("height", CONFIG.HEIGHT)

    /* Percent chart section */

    this.percentText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    // text
    this.percentGroup = this.grid
      .append("div")
      .attr("class", "percent-container")

    // viz
    this.percentDiv = this.percentGroup
      .append("div")

    /* Donut chart section */

    // text
    this.donutText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    // viz
    this.donutGroup = this.grid
      .append("div")
      .attr("class", "donut-container")

    this.donutSvg =
      this.donutGroup
        .append("svg")
        .attr("width", this.setWidth)
        .attr("height", CONFIG.HEIGHT)

    /* Area chart section */

    // text
    this.areaText = this.grid
      .append("div")
      .attr("class", "text-wrapper")

    // viz
    this.areaGroup = this.grid
      .append("div")
      .attr("class", "area-container")

    this.areaSvg = this.areaGroup
      .append("svg")
      .attr("width", this.setWidth)
      .attr("height", CONFIG.HEIGHT)

    this.empty = this.selection
      .append("div")
      .attr("class", "empty")
      .html(TEXT.EMPTY)

    // get width of bar grid item container to pass to visual elements to set width
    this.WIDTH = select('.bar-container').node().getBoundingClientRect().width

    // draw elements that will be redrawn
    this.draw()

    // draw disclaimer text once below charts
    this.drawDisclaimer()
  }

  /* Things that need to update */
  draw() {
    // reset data
    const [averages, count] = getBarData(this.data, this.region, this.experience, this.gender)
    this.count = count.length
    // if data is returned for filtered criteria, show visual elements
    // otherwise show empty state message
    this.grid.classed("hidden", !averages.length)
    this.empty.classed("hidden", averages.length)
    // if data returned, update visuals
    if (averages.length) {
      // add user input to data
      this.barData = [['You', { avg_pay_high: this.salary }], ...averages]
      const [gap, gapPct] = getPercentData(this.barData)
      this.gap = gap
      this.gapPct = gapPct

      this.drawBars()
      this.drawPercent()
      this.drawDonut()
      this.drawArea()
    }

    // always redraw dropdowns to display user selection
    this.drawDropdowns()
  }

  /* Draw Visual Elements */

  // draw wealth gap section
  drawArea() {
    // get area data
    const [areaData, wealth_sum, growth, loss] = getAreaData(this.gap)

    // configure Scales & Axes
    const yDomain = [0, max(areaData.map(([_, dollars]) => dollars))]
    const yRange = loss ? [CONFIG.MARGIN.y, CONFIG.HEIGHT - CONFIG.MARGIN.y] : [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y]
    const xScale = scaleLinear([1, 30], [CONFIG.MARGIN.left, this.WIDTH - CONFIG.MARGIN.right])
    const yScale = scaleLinear(yDomain, yRange)
    const xAxisLine = loss ? axisTop(xScale).ticks(5).tickSizeOuter(0) : axisBottom(xScale).ticks(8).tickSizeOuter(0).tickPadding(14)
    const yAxisLine = axisLeft(yScale).ticks(5).tickFormat(Math.round(this.gap) === 0 ? F.cent : F.thou).tickSizeOuter(0)

    // add text
    this.areaText
      .html(`Your pay gap of <strong>${F.dollar(Math.abs(this.gap))}</strong> could accumulate
        to a <strong>${loss > 0 ? 'loss' : 'gain'}
        of ${F.dollar(Math.abs(wealth_sum))}</strong> ${TEXT.WEALTH}`)

    // draw chart
    const svg = this.areaSvg

    /* Draw Axes */
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
      .attr('transform', `translate(${CONFIG.MARGIN.left}, 0)`)
      .transition()
      .call(yAxisLine)

    // d3 line generator
    const lineGenerator =
      line()
        .x(([x]) => xScale(x))
        .y(([_, y]) => yScale(y))

    // d3 area generator
    const areaGenerator =
      area()
        .x(([x]) => xScale(x))
        .y0(yScale(0))
        .y1(([_, y]) => yScale(y))

    // draw area
    svg
      .selectAll('path.wealth-gap')
      .data([areaData])
      .join('path')
      .attr('class', 'wealth-gap')
      .transition()
      .attr("fill", CONFIG.COLOR_RANGE[this.toggleVal.text][0])
      .attr("d", areaGenerator)

    // draw line path
    svg
      .selectAll('path.wealth-line')
      .data([areaData])
      .join('path')
      .attr('class', 'wealth-line')
      .transition()
      .attr("stroke", CONFIG.COLOR_RANGE[this.toggleVal.text][1])
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("d", lineGenerator)

    /* Draw Tooltip */
    // append tooltip & tooltip bisector line
    const tooltipLine = svg.append('line').attr("class", "tooltip-line");
    const tooltip = this.selection.append('div').attr('class', 'tooltip').style("display", "none")

    // mouseexit handler
    function removeTooltip() {
      if (tooltip) tooltip.style('display', 'none');
      if (tooltipLine) tooltipLine.style('stroke-width', "0px");
    }

    // mouseenter handler
    function drawTooltip(e) {
      // get intersected year
      const year = Math.floor((xScale.invert(pointer(e)[0])))

      // only draw if mouse is within x-scale range
      if (year >= min(xScale.domain()) && year <= max(xScale.domain())) {
        tooltipLine
          .attr('x1', xScale(year))
          .attr('x2', xScale(year))
          .attr('y1', CONFIG.MARGIN.y)
          .attr('y2', CONFIG.HEIGHT - CONFIG.MARGIN.y)
          .style("stroke-width", "3px")

        // draw tooltip slightly to right of line
        tooltip
          .style('display', 'block')
          .style('top', e.pageY + 10 + 'px')
          .style('left', e.pageX + 10 + 'px')

        // fill total gain / loss at that year into the tooltip display
        tooltip.selectAll('.year')
          .data([year])
          .join('div')
          .attr('class', 'year')
          .html(d => `${growth[d] > 0 ? '-' : '+'}${F.dollar(Math.abs(growth[d]))}`)

      }
    }
    // append hover area
    svg.append('rect')
      .attr('width', this.WIDTH)
      .attr('height', CONFIG.HEIGHT)
      .attr('opacity', 0)
      .on('mousemove', drawTooltip)
      .on('mouseout', removeTooltip);
  }

  drawDonut() {
    // get donut data
    const [donutData, overflowData, date] = getDonutData(this.gapPct)
    // define color scale
    const colorScale = scaleOrdinal(["total_days", "worked_days"], [CONFIG.COLOR_NEU, CONFIG.COLOR_RANGE[this.toggleVal.text][1]])

    // add text
    this.donutText
      .html(`and you work
      <strong>${F.num(Math.abs(262 * this.gapPct))} days </strong>
      ${this.gapPct > 0 ? 'more' : 'less'}
      than the average respondant to earn the same amount.
      In other words, you
      ${this.gapPct > 0 ? 'would work for free until' : 'could stop working on'}
      <strong>${date}.</strong>`)

    /* d3 donut generator helpers */
    // pie generator for label donut
    const labelGen =
      pie()
        // An accessor to tell the pie where to find the data values
        .value((d) => d.value)

    // pie generator for inner and outer data donuts
    const pieGen =
      pie()
        // An accessor to tell the pie where to find the data values
        .value((d) => d.value)
        .sort((a, b) => descending(a.type, b.type))
        .padAngle(0.02)

    // configurable arc generator function for all donuts
    const arcGen = (donutRadius, space = 10) =>
      arc()
        .innerRadius(donutRadius)
        .outerRadius(donutRadius - space)
        .cornerRadius(10); // round donut corners

    // draw donut
    const svg = this.donutSvg

    const labelData =
      MONTHS.map((d) => ({ type: d, value: 1 }))

    // draw label donut
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
          .attr('transform', (d, i) => `translate(${arcGen(150).centroid(d)})`) // append month text labels outside of largest donut
          .attr('text-anchor', 'middle')
          .text(({ data }) => data.type)

      )
      .call((g) =>
        g
          .selectAll("path.label-donut")
          .data((d) => pieGen(d))
          .join("path")
          .attr("class", "label-donut")
          .transition()
          .attr("d", d => arcGen(120, 5, 10)(d)) // create largest donut arcs
      )


    // draw outer donut
    svg
      .selectAll("g.outer-donut")
      .data([donutData])
      .join("g")
      .attr("class", "outer-donut")
      .attr(
        "transform",
        `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.outer-donut")
          .data((d) => pieGen(d))
          .join("path")
          .attr("class", "outer-donut")
          .style("fill", (d) => colorScale(d.data.type))
          .transition()
          .attr("d", d => arcGen(100)(d))
      )

      .call((g) =>
        g
          .selectAll("text.donut")
          .data((d) => d)
          .join("text")
          .attr("class", "donut")
          .text(({ type, value }) => type === "worked_days" ? (262 - value > 0 ? "-" : "+") + (Math.abs(262 - value)).toFixed(2) + " days" : "")
          .attr("dy", "0.25em")
      )

    // draw inner "overflow" donut (conditional on whether user works more or less days than average)
    svg
      .selectAll("g.inner-donut")
      .data([overflowData])
      .join("g")
      .attr("class", "inner-donut")
      .attr(
        "transform",
        `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`
      )
      .call((g) =>
        g
          .selectAll("path.inner-donut")
          .data((d) => pieGen(d))
          .join("path")
          .style("fill", (d) => colorScale(d.data.type))
          .attr("class", "inner-donut")
          .transition()
          .attr("d", d => arcGen(80)(d))
      )

  }

  drawPercent() {
    // add text
    this.percentText
      .html(`This means you earn <strong>${(100 - this.gapPct * 100).toFixed(0)} cents</strong> on the dollar`)

    // define scale for concentric circles
    const scale = scaleSqrt()
      .domain([0, 1])
      .range([1, 200]); // dollar circle has diameter of 200

    // get width & height of div from pct
    const pctOfWhole = 1 - this.gapPct
    const scaledPct = scale(pctOfWhole) // scale according to dollar circle
    const translateAmount = (200 - scaledPct) / 2 // amount circle needs to be translated to be positioned at center
    // draw chart
    this.percentDiv
      .selectAll(`.${C.PCT}`)
      .data([this.gapPct])
      .join("div")
      .attr("class", `${C.PCT}`)
      .attr("transform", `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT / 2})`)
      .call(div => div
        .selectAll('.cent-wrapper')
        .data(d => [d])
        .join('div')
        .attr('class', 'cent-wrapper')
        .call(div => div
          .selectAll('.cent-number')
          .data(d => [d])
          .join('div')
          .attr('class', 'cent-number')
          .html(d => `${(100 - d * 100).toFixed(0)}¢`) // add cent text
        )
        // draw cents on the dollar circle
        .call(div => div
          .selectAll('.cent-circle')
          .data(d => [d])
          .join('div')
          .attr('class', 'cent-circle')
          .style('width', `${scaledPct}px`)
          .style('height', `${scaledPct}px`)
          .style('left', `${translateAmount}px`)
          .style('top', `${translateAmount}px`)
        ))
      // draw dollar circle
      .call(div => div
        .selectAll('.pct-label')
        .data(d => [d])
        .join('div')
        .attr('class', 'pct-label'))
  }

  drawBars() {
    /* Configure Scales and Axes */
    const yScale = scaleLinear([0, max(this.barData.map(([_, { avg_pay_high }]) => avg_pay_high))], [CONFIG.HEIGHT - CONFIG.MARGIN.y, CONFIG.MARGIN.y])
    const xScale = scaleBand(["You", this.gender], [CONFIG.MARGIN.left, this.WIDTH - CONFIG.MARGIN.right]).padding(.05)
    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisLeft(yScale).ticks(5).tickFormat(F.thou).tickSizeOuter(0)
    const colorScale = scaleOrdinal(["You", this.gender], CONFIG.COLOR_RANGE[this.toggleVal.text])

    // add text
    this.barText
      .html(`<span> You earn</span >
    <strong>${format("($,.0f")(Math.abs(this.gap))}
    ${this.gap > 0 ? 'less' : 'more'}</strong>
    <span>than average income of the <strong>${this.count}</strong>
    survey respondants who meet your filter criteria. The average yearly income is ${F.dollar(this.barData[1][1].avg_pay_high)}.</span>`)

    // add chart
    const svg = this.barSvg

    // x-axis
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
      .attr('transform', `translate(${this.WIDTH / 2}, ${CONFIG.HEIGHT})`)
      .text('Gender')

    // Y-Axis
    svg
      .selectAll(`g.${C.Y}-${C.AXIS}`)
      .data([0])
      .join('g')
      .attr('class', `${C.Y}-${C.AXIS}`)
      .attr('transform', `translate(${CONFIG.MARGIN.left}, 0)`)
      .transition()
      .call(yAxis)

    // Y-Axis label
    svg
      .selectAll(`text.${C.Y}-${C.AXIS}-${C.LABEL}`)
      .data([0])
      .join('text')
      .attr('class', `${C.Y}-${C.AXIS}-${C.LABEL}`)
      .attr('transform', `translate(${20}, ${CONFIG.HEIGHT / 2})rotate(-90)`)
      .text('Yearly Income')

    /* draw bar */
    svg
      .selectAll(`g.${C.BAR}`)
      .data(this.barData)
      .join("g")
      .attr("class", `${C.BAR}`)
      .attr("transform", ([gender]) => `translate(${xScale(gender)}, ${0})`
      )
      .selectAll(`rect.${C.BAR}`)
      .data((d) => [d])
      .join(enter =>
        enter
          .append("rect")
          .attr("y", yScale(0)) // start at zero on enter for smooth transition
      )
      .attr("class", `${C.BAR}`)
      .attr("rx", 5)
      .attr("width", xScale.bandwidth())
      .transition()
      .attr("y", ([, { avg_pay_high }]) => yScale(avg_pay_high))
      .attr(
        "height",
        ([_, { avg_pay_high }]) => CONFIG.HEIGHT - CONFIG.MARGIN.y - yScale(avg_pay_high)
      )
      .attr("fill", ([gender]) => colorScale(gender))
  }


  drawDisclaimer() {
    this.selection
      .selectAll(".disclaimer")
      .data([0])
      .join("div")
      .attr('class', 'disclaimer')
      .call(div =>
        div
          .selectAll(".regions-disclaimer")
          .data([0])
          .join("div")
          .attr('class', 'regions-disclaimer')
          .html("I divided the countries in the survey into the following regions:")
      )
      .call(div => div
        .selectAll('.region-ul')
        .data([0])
        .join("ul")
        .attr('class', 'region-ul')
        .selectAll('.region-list')
        .data(Object.entries(REGIONS).filter(([k, v]) => k !== "All Regions"))
        .join('li')
        .attr('class', 'region-list')
        .html(([k, v]) => `<strong>${k}</strong>: ${v.sort().join(", ")}`))
      .call(div =>
        div.selectAll(".experience-disclaimer")
          .data([0])
          .join("div")
          .attr('class', 'experience-disclaimer')
          .html("I divided the experience levels in the survey into the following brackets:")
      )
      .call(div =>
        div
          .selectAll('.experience-ul')
          .data([0])
          .join("ul")
          .attr('class', 'experience-ul')
          .selectAll('.experience-list')
          .data(Object.entries(EXPERIENCE).filter(([k, v]) => k !== "Any"))
          .join('li')
          .attr('class', 'experience-list')
          .html(([k, v]) => `<strong>${k}</strong>: ${v.sort().join(", ")}`))
  }

  // draw filters
  drawDropdowns() {
    // region filter
    new DropDown(this.regionWrapper,
      Object.keys(REGIONS),
      this.region,
      d => this.handleFilter(d, FILTERS.REGION));

    // gender filter
    new DropDown(this.genderWrapper,
      GENDERS,
      this.gender,
      d => this.handleFilter(d, FILTERS.GENDER));

    // experience filter
    new DropDown(this.experienceWrapper,
      Object.keys(EXPERIENCE),
      this.experience,
      d => this.handleFilter(d, FILTERS.EXPERIENCE), false);
  }

  /* Handlers and Helpers */

  // on filter selection, update relevant class member variable
  // and redraw visuals
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

  // return width of parent node
  setWidth() {
    return select(this.parentNode).style('width')
  }

}