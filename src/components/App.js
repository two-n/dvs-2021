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
    // this.currentSize = window.innerWidth // current window size
    // window.onresize = () => {
    //   // const nextSize = window.innerWidth
    //   // if (this.currentSize < 1200 & nextSize > 1200 || this.currentSize > 1200 & nextSize < 1200) {
    //   this.chart.clear()
    //   // this.currentSize = nextSize // reset current window size
    //   this.chart.init()

    //   // }
    // }
  }
}