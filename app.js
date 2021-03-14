// https://api.tdameritrade.com/v1/accounts/497245329/transactions
const raw_transactions = require('./data/transactions2.json')

const transactions = raw_transactions.reverse()
const optionIdMap = {}
const thetaTrades = {}
const optionTrades = {}

const closeTrade = (option) => {
  let openDate = new Date(new Date(option.open.date).toDateString())
  let closeDate = new Date(new Date(option.close.date).toDateString())
  option.status = 'closed'
  option.results = {}
  option.results['P/L'] = parseFloat((option.open.premium - option.close.cost).toFixed(2))
  option.results['P/L%'] = parseFloat(((option.open.premium - option.close.cost)*100/option.open.premium).toFixed(2))
  option.results['days_held'] = (closeDate.getTime() - openDate.getTime())/(1000 * 3600 * 24)

  if (option.type === 'PUT') {
    option.results['ROR%'] = parseFloat((100*option.results['P/L']/option.open.collateral).toFixed(2))
  }
}


const getOpenInfo = () => {
  let putPremium = 0
  let callPremium = 0
  Object.keys(thetaTrades).forEach(trade => {
    if (thetaTrades[trade].type === 'PUT' && thetaTrades[trade].status === 'open') {
      putPremium += thetaTrades[trade].open.premium
    }
    else if (thetaTrades[trade].type === 'CALL' && thetaTrades[trade].status === 'open') {
      callPremium += thetaTrades[trade].open.premium
    }
  })
  return {
    putPremium,
    callPremium,
    total: putPremium + callPremium
  }
}
const analyzeThetaTrades = () => {
  let closedPremium = 0
  let numClosed = 0
  let numOpen = 0
  let openPremium = 0
  let totCollateral = 0
  Object.values(thetaTrades).forEach(trade => {
    if (trade.status === 'closed') {
      console.log(trade.results)
      closedPremium += trade.open.premium - trade.close.cost
      numClosed += 1
    } else {
      totCollateral += trade.open.collateral
      openPremium += trade.open.premium
      numOpen += 1
    }
  })
  console.log({ closedPremium, numClosed, numOpen, openPremium, totCollateral })

}

transactions.map(transaction => {
  // if transaction related to an option trade
  if (transaction.type === 'TRADE' && transaction.transactionItem.instrument && transaction.transactionItem.instrument.assetType === 'OPTION') {
    let option = transaction.transactionItem
    let optionName = option.instrument.description

    const descriptionArr = optionName.split(' ')
    let underlyingSymbol = option.instrument.underlyingSymbol
    let optionType = option.instrument.putCall
    let strike = descriptionArr[descriptionArr.length - 2]
    let exp_date = option.instrument.optionExpirationDate
    let cusip = option.instrument.cusip

    // console.log(option)
    if (option.instruction === 'SELL' && option.positionEffect === 'OPENING') {  
      if (!optionIdMap[cusip]) optionIdMap[cusip] = optionName

      if(!thetaTrades[optionName]) {
        thetaTrades[optionName] = {
          stock_symbol: underlyingSymbol,
          exp_date,
          type: optionType,
          strike: strike,
          status: 'open',
          open: {
            date: transaction.transactionDate,
            quantity: 0,
            price: 0,
            premium: 0,
            collateral: 0
          },
          close: {
            quantity: 0,
            price: 0,
            cost: 0
          }
        }
      }
      let openLeg = thetaTrades[optionName].open
      openLeg.price = (option.price *  option.amount + openLeg.price * openLeg.quantity) / (option.amount + openLeg.quantity)
      openLeg.quantity += option.amount
      openLeg.premium += transaction.netAmount
      if (optionType === 'PUT') openLeg.collateral += option.amount * strike * 100
    }
    else if (option.instruction === 'BUY' && option.positionEffect === 'CLOSING') {
      let closeLeg = thetaTrades[optionName].close
      closeLeg.price = (option.price *  option.amount + closeLeg.price * closeLeg.quantity) / (option.amount + closeLeg.quantity)
      closeLeg.quantity += option.amount
      closeLeg.cost -= transaction.netAmount
      closeLeg.date = transaction.transactionDate
      if (thetaTrades[optionName].open.quantity === closeLeg.quantity) {
        closeTrade(thetaTrades[optionName])
      }
    }
    // else if (option.instruction === 'BUY') {
    //   if (!optionTrades[optionName]) {
    //     optionTrades[optionName] = {
    //     stock_symbol: underlyingSymbol,
    //     exp_date,
    //     type: optionType,
    //     strike: strike,
    //     status: 'open',
    //     open: {
    //       date: transaction.transactionDate,
    //       quantity: 0,
    //       price: 0,
    //       premium: 0,
    //       collateral: 0
    //     },
    //     close: {
    //       quantity: 0,
    //       price: 0,
    //       cost: 0
    //     }
    //   }}
    // }
  }
  // if transaction related to option expirary
  else if (transaction.transactionSubType === 'OX') {
    let cusip = transaction.transactionItem.instrument.cusip
    if (optionIdMap[cusip]) {
      let option = thetaTrades[optionIdMap[cusip]]
      let closeLeg = option.close
      closeLeg.quantity += transaction.transactionItem.amount
      closeLeg.date = transaction.transactionDate

      if (option.open.quantity === closeLeg.quantity) {
        closeTrade(thetaTrades[optionIdMap[cusip]])
      }
    }
  }
})
analyzeThetaTrades()
console.log('getOpenInfo', getOpenInfo())