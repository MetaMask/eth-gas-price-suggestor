const test = require('tape')
const TestRPC = require('ethereumjs-testrpc')
const Eth = require('ethjs-query')
const BlockTracker = require('eth-block-tracker')
const DEFAULT_PRICE = 20000000000

const Suggestor = require('../')

test('should initialize and advise current eth_gasPrice', async function (t) {
  const provider = TestRPC.provider({ locked: false })
  const blockTracker = new BlockTracker({ provider })
  blockTracker.start()
  const suggestor = new Suggestor({ blockTracker })
  let suggested
  try {
    suggested = await suggestor.currentAverage()
  } catch (e) {
    t.error(e, 'should not fail')
  }
  t.equal(suggested, DEFAULT_PRICE, 'Default testrpc gas price.')
  blockTracker.stop()
  t.end()
})

test('should increase with a new tx added', async function (t) {
  t.plan(1)
  const provider = TestRPC.provider({ locked: false })
  const eth = new Eth(provider)
  const doublePrice = DEFAULT_PRICE * 2
  let suggested, blockTracker

  try {

    const accounts = await eth.accounts()
    const account = accounts[0]

    blockTracker = new BlockTracker({ provider })
    blockTracker.start()
    const historyLength = 2
    const suggestor = new Suggestor({ blockTracker, historyLength })

    await eth.sendTransaction({
      from: account,
      to: account,
      value: '1',
      gasPrice: doublePrice * 2, // quadrouple price
      data: null,
    })

    await new Promise((resolve, reject) => {
      setTimeout(resolve, 100)
    })

    suggested = await suggestor.currentAverage()
  } catch (e) {
    t.error(e, 'should not fail')
    blockTracker.stop()
    t.end()
  }

  t.equal(suggested, doublePrice, 'Doubled testrpc gas price.')
  blockTracker.stop()
  t.end()
})

