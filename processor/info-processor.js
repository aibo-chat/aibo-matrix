const defedAi = require("../vender/defed-ai");
const matrixBotUserMapper = require("../dao/matrix-bot-user-mapper");
const processorUtils = require('./processor-utils')

async function infoBot(bot, room_id, sender, ques) {
  let {msg, type, tokens} = ques;
  let chat_id = await processorUtils.createChatId(bot.localpart, room_id);
  let res = undefined;
  try {
    if (type) {
      res = await defedAi.preset(chat_id, room_id, msg, type, tokens);
    } else {
      res = await defedAi.chat(chat_id, room_id, msg, "info");
    }
    if (res?.data?.action == 'greeting') {
      return await processorUtils.botIntroduction(bot.localpart);
    } else if (res?.data?.action == 'transfer') {
      console.log(res);
      let {action, network, token, amount, target} = res?.data.answer;
      let {network: n, symbol: s, amount: a} = transferReceiver(network, token, amount, msg);
      let head_title = "Hey buddy, let me show you a trick: use the transfer function!\nIt's as easy as pie! You can also check your account balance in real time!";
      let body = {head_title, amount: a, target, network: n, symbol: s}
      return {body, msgtype: "d.common_transfer"}
    } else if (res?.data?.action == 'convert') {
      console.log(res);
      let {
        orderType: order_type, fromAmount: from_amount, fromToken: from_symbol, fromNetwork: from_network,
        toAmount: to_amount, toToken: to_symbol, toNetwork: to_network, price
      } = res?.data.answer;
      let a = {order_type, from_network, from_symbol, from_amount, to_network, to_symbol, to_amount, price};
      let body = convertResolver(a, msg);
      body.head_title="Hey there, allow me to introduce you to the Convert function, your one-stop shop for all things DEX aggregation!";
      body.original_answer = res?.data.answer
      return {body, msgtype: "d.convert"}
    }


    if (res.data.answerType == 'news') {
      return {body: res.data, msgtype: "d.news"}
    } else if (res.data.answerType == 'metrics') {
      return {body: res.data, msgtype: "d.metrics"}
    } else if (res.data.answerType == 'posts') {
      return {body: res.data, msgtype: "d.posts"}
    } else if (res.data.answerType == 'index') {
      return {body: res.data, msgtype: "d.index"}
    } else if (res.data.answerType == 'digest') {
      return {body: res.data, msgtype: "d.digest"}
    } else if (res.data.answerType == 'etf') {
      return {body: res.data, msgtype: "d.etf"}
    }
    return res.data.answer;
  } catch (e) {
    console.log(res);
    console.log(e);
    return "An error occurred. You can try asking again later";
  }
}

async function handle(bot, room_id, sender, ques) {
  let user = await processorUtils.getUser(bot.localpart, sender);
  if (user.call_count++ >= (process.env.AI_CALL_COUNT_PER_DAY || 10)) {
    return `Only ${process.env.AI_CALL_COUNT_PER_DAY || 10} times a day, today you have used up`;
  }
  let res;
  res = await throttles[bot.localpart](async () => {
    let r = await infoBot(bot, room_id, sender, ques);
    await matrixBotUserMapper.updateCallCount(user.id, user.call_date, user.call_count);
    return r;
  }, () => {
    return 'Info bot rate limit exceeded';
  })
  if (res) return res;
  return "The little ones will be here soon, 🏇🏇🏇";
}


// "ethereumWBTC-ethereumUSDT": {from_network: "ethereum", to_network: "ethereum", from_symbol: "wbtc", to_symbol: "usdt"},
// "ethereumETH-ethereumUSDT": {from_network: "ethereum", to_network: "ethereum", from_symbol: "eth", to_symbol: "usdt"},
// "ethereumUSDC-ethereumUSDT": {from_network: "ethereum", to_network: "ethereum", from_symbol: "usdc", to_symbol: "usdt"},
// "polygonUSDT-ethereumUSDT": {from_network: "polygon", to_network: "ethereum", from_symbol: "usdt", to_symbol: "usdt"},
// "polygonUSDC-ethereumUSDC": {from_network: "polygon", to_network: "ethereum", from_symbol: "usdc", to_symbol: "usdc"},
// "polygonUSDT-polygonUSDC": {from_network: "polygon", to_network: "polygon", from_symbol: "usdt", to_symbol: "usdc"},
// "polygonAAVE-polygonUSDT": {from_network: "polygon", to_network: "polygon", from_symbol: "aave", to_symbol: "usdt"},
// "polygonAAVE-polygonUSDC": {from_network: "polygon", to_network: "polygon", from_symbol: "aave", to_symbol: "usdc"},

const CONVERT_SYMBOL_MAP = {
  "(a)?(eth-)?(eth)?(ethereum)?wbtc": {symbol: "WBTC", network: "ethereum"},
  "(a)?(eth-)?(eth)?(ethereum)?((btc)|(bitcoin)|(比特币))": {symbol: "WBTC", network: "ethereum"},
  "(a)?(eth-)?(eth)?(ethereum)?((eth)|(ethereum)|(以太币))": {symbol: "ETH", network: "ethereum"},
  "((a)|(eth-)|(eth)|(ethereum))usdt": {symbol: "USDT", network: "ethereum"},
  "((a)|(eth-)|(eth)|(ethereum))usdc": {symbol: "USDC", network: "ethereum"},
  "((v)|(poly-)|(poly)|(polygon))usdt": {symbol: "USDT", network: "polygon"},
  "((v)|(poly-)|(poly)|(polygon))usdc": {symbol: "USDC", network: "polygon"},
  "(v)?(poly-)?(poly)?(polygon)?aave": {symbol: "AAVE", network: "polygon"},
  "usdt": {symbol: "USDT"},
  "usdc": {symbol: "USDC"}
}

function convertResolver(body, msg) {
  let {order_type, from_network, from_symbol, from_amount, to_network, to_symbol, to_amount, price} = body;
  if (!order_type) order_type = '';
  if (!from_amount) from_amount = '';
  if (!to_amount) to_amount = '';
  if (!price) price = '';

  if (order_type != "market" && order_type != "limit") order_type = '';

  //识别出来数字
  let m = from_amount.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  from_amount = m ? m[0] : ''
  m = to_amount.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  to_amount = m ? m[0] : ''
  m = price.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  price = m ? m[0] : ''

  //规范化network
  if (!from_network) from_network = '';
  if (!to_network) to_network = '';
  if (from_network) from_network = (from_network.match(/polgyon/)) ? "polygon" : "ethereum";
  if (to_network) to_network = (to_network.match(/polygon/)) ? "polygon" : "ethereum";

  let isMatch = false;
  if (from_symbol) {
    for (let p in CONVERT_SYMBOL_MAP) {
      if (m = from_symbol.match(new RegExp(p))) {
        let v = CONVERT_SYMBOL_MAP[p];
        from_symbol = v.symbol;
        if (v.network) from_network = v.network;
        if (!v.network && !from_network) from_network = 'ethereum';
        isMatch = true;
        break;
      }
    }
  }
  if (!isMatch) from_symbol = '';

  isMatch = false;
  if (to_symbol) {
    for (let p in CONVERT_SYMBOL_MAP) {
      if (m = to_symbol.match(new RegExp(p))) {
        let v = CONVERT_SYMBOL_MAP[p];
        to_symbol = v.symbol;
        if (v.network) to_network = v.network;
        if (!v.network && !to_network) to_network = 'ethereum';
        isMatch = true;
        break;
      }
    }
  }
  if (!isMatch) to_symbol = '';

  return {order_type, from_network, from_symbol, from_amount, to_network, to_symbol, to_amount, price}
}

function convertResolver1(body, msg) {
  let {from_network, from_symbol, from_amount, to_network, to_symbol, to_amount, price} = body;
  if (!msg) msg = '';
  msg = msg.toLowerCase();

  //兜底from_amount,to_amount,price
  if (!from_amount) from_amount = '';
  if (!to_amount) to_amount = '';
  if (!price) price = '';
  let nums = msg.match(/(?!0(\.0+)?$)\d+(\.\d+)?/g);
  let m;
  m = from_amount.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  from_amount = m ? m[0] : (nums ? nums[0] : '');
  m = to_amount.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  to_amount = m ? m[0] : (nums ? nums[1] : '');
  m = price.match(/(?!0(\.0+)?$)\d+(\.\d+)?/);
  price = m ? m[0] : (nums ? nums[2] : '');
  console.log(from_amount, to_amount, price);

  //兜底网络
  if (from_network != "ethereum" && to_network != "polygon") from_network = '';
  if (to_network != "ethereum" && to_network != "polygon") to_network = '';
  m = msg.match(/((ethereum)|(eth)|(以太坊)|(polygon))/g);
  if (!from_network && m && m[0]) from_network = (m[0] == 'ethereum' || m[0] == 'eth' || m[0] == '以太坊') ? "ethereum" : "polygon";
  if (!to_network && m && m[1]) to_network = (m[1] == 'ethereum' || m[1] == 'eth' || m[1] == '以太坊') ? "ethereum" : "polygon";
  console.log("n", from_network, to_network);

  //兜底symbol
  let arr = []
  let tmp_msg = msg;
  for (let p in CONVERT_SYMBOL_MAP) {
    if (m = tmp_msg.match(new RegExp(p))) {
      if (m) {
        arr.push(CONVERT_SYMBOL_MAP[p]);
        tmp_msg = tmp_msg.substring(m.index + m[0].length);
      }
    }
  }
  console.log("arr", arr);
  let isMatch = false;
  //根据ai返回的网络进行匹配
  if (from_symbol) {
    for (let p in CONVERT_SYMBOL_MAP) {
      if (m = from_symbol.match(new RegExp(p, 'g'))) {
        let v = CONVERT_SYMBOL_MAP[p];
        from_symbol = v.symbol;
        if (v.network) from_network = v.network;
        if (!v.network && !from_network) from_network = 'ethereum';
        isMatch = true;
        break;
      }
    }
  }
  //如果ai返回的网络不匹配，就根据自己识别出来的symbol来
  if (!isMatch && arr[0]) {
    from_symbol = arr[0].symbol;
    if (arr[0].network) from_network = arr[0].network;
    if (!arr[0].network && !from_network) from_network = 'ethereum';
  }


  //根据ai返回的网络进行匹配
  isMatch = false;
  if (to_symbol) {
    for (let p in CONVERT_SYMBOL_MAP) {
      if (m = to_symbol.match(new RegExp(p, 'g'))) {
        let v = CONVERT_SYMBOL_MAP[p];
        to_symbol = v.symbol;
        if (v.network) to_network = v.network;
        if (!v.network && !to_network) to_network = 'ethereum';
        isMatch = true;
        break;
      }
    }
  }
  //如果ai返回的网络不匹配，就根据自己识别出来的symbol来
  if (!isMatch && arr[1]) {
    to_symbol = arr[1].symbol;
    if (arr[1].network) to_network = arr[1].network;
    if (!arr[1].network && !to_network) to_network = 'ethereum';
  }
  console.log("s", from_network, from_symbol, to_network, to_symbol)
  let b = {from_network, from_symbol, from_amount, to_network, to_symbol, to_amount, price}
  return b;
}

const TRANSFER_TOKEN_MAP = {
  "ethereum-(a)?(eth-)?(eth)?(ethereum)?((eth)|(ethereum))": {symbol: "ETH", network: "ethereum"},
  "ethereum-(a)?(eth-)?(eth)?(ethereum)?wbtc": {symbol: "WBTC", network: "ethereum"},
  "ethereum-(a)?(eth-)?(eth)?(ethereum)?((btc)|(bitcoin))": {symbol: "WBTC", network: "ethereum"},
  "ethereum-(a)?(eth-)?(eth)?(ethereum)?usdt": {symbol: "USDT", network: "ethereum"},
  "ethereum-(a)?(eth-)?(eth)?(ethereum)?usdc": {symbol: "USDC", network: "ethereum"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?usdc.e": {symbol: "USDC.E", network: "polygon"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?usdc": {symbol: "USDC", network: "polygon"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?usdt": {symbol: "USDT", network: "polygon"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?matic": {symbol: "MATIC", network: "polygon"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?defe": {symbol: "DEFE", network: "polygon"},
  "polygon-(v)?(poly-)?(poly)?(polygon)?aave": {symbol: "AAVe", network: "polygon"},
}


function transferReceiver(network, symbol, amount, msg) {
  if (!network) network = '';
  network = network.toLowerCase();
  if (!symbol) symbol = '';
  symbol = symbol.toLowerCase();
  if (!msg) msg = "";
  msg = msg.toLowerCase();

  //兜底amount
  if (!amount || amount == '0') amount = '';
  let m = amount.match(/[\d.]+/) || msg.match(/[\d.]+/)
  amount = m ? m[0] : '0';


  //兜底网络
  if (network != 'polygon' && network != 'ethereum') {
    if (msg.indexOf('polygon') >= 0) network = 'polygon';
    if (msg.indexOf('ethereum') >= 0) network = 'ethereum';
  }
  if (network != 'polygon' && network != 'ethereum') network = 'polygon'

  //兜底symbol
  let isSymbol = false;
  for (let p in TRANSFER_TOKEN_MAP) {
    if (symbol.match(new RegExp("^" + p.substring(p.indexOf("-") + 1)) + "$")) isSymbol = true;
  }
  if (!isSymbol) {
    for (let p in TRANSFER_TOKEN_MAP) {
      let m;
      if (m = msg.match(new RegExp(p.substring(p.indexOf("-") + 1)))) symbol = m[0];
    }
  }

  let token = match(network, symbol);
  if (token) return {amount, ...token};
  if (symbol) {
    token = match('polygon', symbol);
    if (token) return {amount, ...token};
    token = match('ethereum', symbol);
    if (token) return {amount, ...token};
  }

  return {network: network, symbol: "", amount}
}

function match(network, symbol) {
  for (let p in TRANSFER_TOKEN_MAP) {
    if (`${network}-${symbol}`.match(new RegExp(p))) {
      return TRANSFER_TOKEN_MAP[p];
    }
  }
}

module.exports = {handle}
