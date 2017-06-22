const test = require('tape')
const BN = require('bn.js')
const TestRPC = require('ethereumjs-testrpc')
const BlockTracker = require('eth-block-tracker')
const DEFAULT_PRICE_BN = new BN(20000000000)
const DEFAULT_PRICE = DEFAULT_PRICE_BN.toString()

const Eth = require('ethjs');
const provider = new Eth.HttpProvider('https://mainnet.infura.io');

const Suggestor = require('../')

const blockTracker = new BlockTracker({ provider })
blockTracker.start()

const suggestor = new Suggestor({ blockTracker })

setInterval(async function() {
  try {
    const suggested = await suggestor.currentAverage()
    console.log('CURRENT SUGGESTION in GWEI: ' + Eth.fromWei(suggested, 'gwei'))
  } catch (e) {
    console.log('failed: ', e)
  }
}, 10000)


