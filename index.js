

class Suggestor {

  constructor (opts = {}) {
    this.blockTracker = opts.blockTracker
    if (!this.blockTracker) {
      throw new Error('gas suggestor requires a block tracker.')
    }

    this.historyLength = opts.historyLength || 20
    this.defaultPrice = opts.defaultPrice || 20000000000

    this.query = this.blockTracker._query
    this.recentPriceAverages = []
    this.firstPriceQuery = this.fetchFirstGasPrice()
  }

  fetchFirstGasPrice() {
    return new Promise((resolve, reject) => {

      this.query.gasPrice((err, gasPriceBn) => {
        if (err) {
          console.warn('Failed to retrieve gas price, defaulting.', err)
          this.fillHistoryWith(this.defaultPrice)
        } else {
          const gasPrice = parseInt(gasPriceBn.toString(10))
          this.fillHistoryWith(gasPrice)
        }
        return resolve(this.currentAverage())
      })
    })
  }

  fillHistoryWith (value) {
    for (let i = 0; i < this.historyLength; i++) {
      this.recentPriceAverages.push(value)
    }
  }

  async currentAverage() {
    if (this.recentPriceAverages.length === 0) {
      this.firstPriceQuery
      return this.firstPriceQuery
    }

    const sum = this.recentPriceAverages.reduce((result, value) => {
      return result + value
    }, 0)
    const result = sum / this.recentPriceAverages.length
    return result
  }

}

module.exports = Suggestor
