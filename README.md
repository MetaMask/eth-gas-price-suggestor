# Eth Gas Price Suggestor

A module for getting the current average gas price of ethereum transactions.

## Installation

`npm install eth-gas-price-suggestor -S`

## Example Usage

```javascript
const Eth = require('ethjs');
const provider = new Eth.HttpProvider('https://mainnet.infura.io');
const BlockTracker = require('eth-block-tracker')
const Suggestor = require('eth-gas-price-suggestor')

const blockTracker = new BlockTracker({ provider })
blockTracker.start()

const suggestor = new Suggestor({
 blockTracker,
 historyLength: 10, // number of blocks to average, default 20.
 defaultPrice: 20000000000, // In case of network error. Default 20 gwei.
})

setInterval(async function() {
  try {
    const suggested = await suggestor.currentAverage()
    console.log('CURRENT SUGGESTION in GWEI: ' + Eth.fromWei(suggested, 'gwei'))
  } catch (e) {
    console.log('failed: ', e)
  }
}, 10000)

```
