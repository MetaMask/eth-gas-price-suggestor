const BN = require('bn.js')
const Eth = require('ethjs');

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
    this.trackBlocks()
  }

  trackBlocks() {
    this.blockTracker.on('block', block => this.processBlock(block))
  }

  processBlock (newBlock) {
    if (newBlock.transactions.length === 0) {
      return
    }

    const gasPriceSum = newBlock.transactions
    .map(tx => Eth.toBN(tx.gasPrice))
    .reduce((result, gasPrice) => {
      return result.add(gasPrice)
    }, new BN(0))

    const average = gasPriceSum.divn(newBlock.transactions.length)
    this.recentPriceAverages.push(average.toNumber())

    if (this.recentPriceAverages.length > this.historyLength) {
      this.recentPriceAverages.shift()
    }
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
    this.recentPriceAverages.push(value)
  }

  async currentAverage() {
    if (this.recentPriceAverages.length === 0) {
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

