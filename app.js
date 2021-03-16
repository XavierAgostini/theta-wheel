// https://api.tdameritrade.com/v1/accounts/497245329/transactions
const raw_transactions = require('./data/transactions2.json')
const fs = require('fs')
const transactions = raw_transactions.reverse()


const closeTrade = (option) => {
  let openDate = new Date(new Date(option.open.date).toDateString())
  let closeDate = new Date(new Date(option.close.date).toDateString())
  option.status = 'closed'
  option.results = {}

  if (option.tradeType === 'short') {
    option.results['P/L'] = parseFloat((option.open.cost - option.close.cost).toFixed(2))
    option.results['P/L%'] = parseFloat(((option.open.cost - option.close.cost)*100/option.open.cost).toFixed(2))
    if (option.type === 'PUT') {
      option.results['ROR%'] = parseFloat((100*option.results['P/L']/option.open.collateral).toFixed(2))
    }
  } else {
    option.results['P/L'] = parseFloat((option.close.cost - option.open.cost).toFixed(2))
    option.results['P/L%'] = parseFloat(((option.close.cost - option.open.cost)*100/option.open.cost).toFixed(2))
    option.results['ROR%'] = parseFloat((100*option.results['P/L']/option.open.cost).toFixed(2))
  }
  
  option.results['days_held'] = (closeDate.getTime() - openDate.getTime())/(1000 * 3600 * 24)

  
}


const getOpenInfo = () => {
  let putPremium = 0
  let callPremium = 0
  Object.keys(options).forEach(trade => {
    if (options[trade].type === 'PUT' && options[trade].status === 'open') {
      putPremium += options[trade].open.cost
    }
    else if (options[trade].type === 'CALL' && options[trade].status === 'open') {
      callPremium += options[trade].open.cost
    }
  })
  return {
    putPremium,
    callPremium,
    total: putPremium + callPremium
  }
}
const analyzeoptions = () => {
  let closedPremium = 0
  let numClosed = 0
  let numOpen = 0
  let openPremium = 0
  let totCollateral = 0
  Object.values(options).forEach(trade => {
    if (trade.status === 'closed') {
      // console.log(trade.results)
      closedPremium += trade.open.cost - trade.close.cost
      numClosed += 1
    } else {
      totCollateral += trade.open.collateral
      openPremium += trade.open.cost
      numOpen += 1
    }
  })
  console.log({ closedPremium, numClosed, numOpen, openPremium, totCollateral })

}

const parseTransactions = (transactions) => {
  const optionIdMap = {}
  const options = {}

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

      const optionSymbol = option.instrument.symbol
      // console.log(option)
      if (option.instruction === 'SELL' && option.positionEffect === 'OPENING') {  
        if (!optionIdMap[cusip]) optionIdMap[cusip] = optionSymbol

        if(!options[optionSymbol]) {
          options[optionSymbol] = {
            id: optionSymbol,
            name: optionName,
            stock_symbol: underlyingSymbol,
            exp_date,
            type: optionType,
            tradeType: 'short',
            strike: strike,
            status: 'open',
            open: {
              date: transaction.transactionDate,
              quantity: 0,
              price: 0,
              cost: 0,
              collateral: 0
            },
            close: {
              quantity: 0,
              price: 0,
              cost: 0
            }
          }
        }
        let openLeg = options[optionSymbol].open
        openLeg.price = (option.price *  option.amount + openLeg.price * openLeg.quantity) / (option.amount + openLeg.quantity)
        openLeg.quantity += option.amount
        openLeg.cost += transaction.netAmount
        if (optionType === 'PUT') openLeg.collateral += option.amount * strike * 100
      }
      else if (option.instruction === 'BUY' && option.positionEffect === 'CLOSING') {
        let closeLeg = options[optionSymbol].close
        closeLeg.price = (option.price *  option.amount + closeLeg.price * closeLeg.quantity) / (option.amount + closeLeg.quantity)
        closeLeg.quantity += option.amount
        closeLeg.cost -= transaction.netAmount
        closeLeg.date = transaction.transactionDate
        if (options[optionSymbol].open.quantity === closeLeg.quantity) {
          closeTrade(options[optionSymbol])
        }
      }
      else if (option.instruction === 'BUY' && option.positionEffect === 'OPENING') {
        if (!optionIdMap[cusip]) optionIdMap[cusip] = optionSymbol

        if(!options[optionSymbol]) {
          options[optionSymbol] = {
            id: optionSymbol,
            name: optionName,
            stock_symbol: underlyingSymbol,
            exp_date,
            type: optionType,
            tradeType: 'long',
            strike: strike,
            status: 'open',
            open: {
              date: transaction.transactionDate,
              quantity: 0,
              price: 0,
              cost: 0
            },
            close: {
              quantity: 0,
              price: 0,
              cost: 0
            }
          }
        }
        let openLeg = options[optionSymbol].open
        openLeg.price = (option.price *  option.amount + openLeg.price * openLeg.quantity) / (option.amount + openLeg.quantity)
        openLeg.quantity += option.amount
        openLeg.cost -= transaction.netAmount
      }
      else if (option.instruction === 'SELL' && option.positionEffect === 'CLOSING' && options[optionSymbol]) {
        
        let closeLeg = options[optionSymbol].close
        closeLeg.price = (option.price *  option.amount + closeLeg.price * closeLeg.quantity) / (option.amount + closeLeg.quantity)
        closeLeg.quantity += option.amount
        closeLeg.cost += transaction.netAmount
        closeLeg.date = transaction.transactionDate
        if (options[optionSymbol].open.quantity === closeLeg.quantity) {
          closeTrade(options[optionSymbol])
        }
      }
    }
    // if transaction related to option expirary
    else if (transaction.transactionSubType === 'OX') {
      let cusip = transaction.transactionItem.instrument.cusip
      if (optionIdMap[cusip]) {
        let option = options[optionIdMap[cusip]] || options[optionIdMap[cusip]]
        // console.log(optionIdMap[cusip])
        let closeLeg = option.close
        closeLeg.quantity += transaction.transactionItem.amount
        closeLeg.date = transaction.transactionDate

        if (option.open.quantity === closeLeg.quantity) {
          closeTrade(option)
        }
      }
    }
    else if (transaction.transactionSubType === 'OE') {
      let cusip = transaction.transactionItem.instrument.cusip
      if (optionIdMap[cusip]) {
        let option = options[optionIdMap[cusip]] || options[optionIdMap[cusip]]
        // console.log(optionIdMap[cusip])
        let closeLeg = option.close
        closeLeg.quantity += transaction.transactionItem.amount
        closeLeg.date = transaction.transactionDate
        closeLeg.cost = closeLeg.quantity * option.strike
        closeLeg['note'] = 'option exercised'
        if (option.open.quantity === closeLeg.quantity) {
          closeTrade(option)
        }
      }
    }
  })
  return options
}

// analyzeoptions()
// console.log('getOpenInfo', getOpenInfo())
const saveTradesToJSON = (transactions) => {
  console.log("Parsing transactions...")
  const optionTrades = parseTransactions(transactions)
  console.log(optionTrades)
  console.log("Writing options trades to file")
  fs.writeFileSync('./data/optionTrades.json', JSON.stringify(Object.values(optionTrades)))
  console.log("Done writting!")
}

saveTradesToJSON(transactions)