// Local
import Chart from './Chart/chart'

export default class App {

  constructor(data) {
    this.data = data

  }

  init() {
    // helpful if we need to update from parent
    this.chart = new Chart(this.data)
    this.chart.init()
  }
}