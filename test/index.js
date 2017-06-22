const test = require('tape')
const TestRPC = require('ethereumjs-testrpc')
const Eth = require('ethjs-query')
const BlockTracker = require('eth-block-tracker')
const DEFAULT_PRICE = 20000000000

const Suggestor = require('../')

test('should initialize and advise current eth_gasPrice', async function (t) {
  const provider = TestRPC.provider({ locked: false })
  const blockTracker = new BlockTracker({ provider })
  const suggestor = new Suggestor({ blockTracker })
  let suggested
  try {
    suggested = await suggestor.currentAverage()
  } catch (e) {
    t.error(e, 'should not fail')
  }
  t.equal(suggested, DEFAULT_PRICE, 'Default testrpc gas price.')

  t.end()
})

test('should increase with a new tx added', async function (t) {
  const provider = TestRPC.provider({ locked: false })
  const eth = new Eth(provider)
  const doublePrice = DEFAULT_PRICE * 2
  let suggested

  try {

    const accounts = await eth.accounts()
    const account = accounts[0]

    const blockTracker = new BlockTracker({ provider })
    const historyLength = 2
    const suggestor = new Suggestor({ blockTracker, historyLength })

    await eth.sendTransaction({
      from: account,
      to: account,
      value: '1',
      gasPrice: doublePrice * 2, // quadrouple price
      data: null,
    })

    suggested = await suggestor.currentAverage()
  } catch (e) {
    t.error(e, 'should not fail')
    t.end()
  }

  t.equal(suggested, doublePrice, 'Default testrpc gas price.')
  t.end()
})

