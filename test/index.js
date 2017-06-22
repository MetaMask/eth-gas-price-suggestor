const test = require('tape')
const TestRPC = require('ethereumjs-testrpc')
const Eth = require('ethjs-query')
const BlockTracker = require('eth-block-tracker')

const Suggestor = require('../')

test('should initialize and advise current eth_gasPrice', t => {
  const provider = TestRPC.provider({ locked: false })
  const blockTracker = new BlockTracker({ provider })
  const suggestor = new Suggestor({ blockTracker })
  const suggested = await suggestor.currentAverage()
  t.equal(suggested, 20000000000, 'Default testrpc gas price.')
})

/*
test('should increase with a new tx added', t => {
  const provider = TestRPC.provider({ locked: false })
  const eth = new Eth(provider)

  const accounts = await eth.getAccounts()
  const account = accounts[0]

  const blockTracker = new BlockTracker({ provider })
  const suggestor = new Suggestor({ blockTracker })

  provider.sendTransactionk

  const suggested = await suggestor.currentAverage()
  t.equal(suggested, 20000000000, 'Default testrpc gas price.')
})
*/


