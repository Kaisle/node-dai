const config = require('config.json')(__dirname + '/config.json');
const BN = require('bn.js');
const Tx = require('ethereumjs-tx');
const fetch = require('node-fetch');
const awaitMined = require('await-transaction-mined');
const Wallet = require('ethereumjs-wallet');
const Web3 = require('web3');

async function getETHPriceInUSD(options) {
    log("Fetching ETH price in USD...", options);
    const response = await fetch(config.CMC_API_URL);
    const json = await response.json();
    ETHPriceUSD = json[0]["price_usd"];
    return ETHPriceUSD;
}

async function waitTillMined(hash, options) {
  log("Submitted transaction: " + hash, options);
  await awaitMined.awaitTx(getWeb3(options), hash, {ensureNotUncle: options.requireConfirm});
  log("Mined transaction: " + hash, options);
}

async function DAIToETH(DAI, options) {
  var ETH_price_USD = await getETHPriceInUSD(options);
  var ETH = parseFloat(DAI) / parseFloat(ETH_price_USD);
  log("Converting " + DAI + " DAI to " + ETH + " ETH...", options);
  hash = await DAIToCDP(DAI, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval || config.DEFAULT_WAIT_BETWEEN_TX_MS);
  await CDPToETH(ETH, options);
}

async function ETHToDAI(ETH, options) {
  var ETH_price_USD = await getETHPriceInUSD(options);
  var DAITotal = (parseFloat(ETH) * parseFloat(ETH_price_USD));
  var DAIToDraw = options.DAIToDraw || DAITotal * config.DEFAULT_DRAW_FACTOR;
  log("Depositing " + ETH + " ETH to CDP with ID " + options.cdpId + " and drawing "
  + DAIToDraw + " DAI... ", options);
  hash = await ETHToWETH(ETH, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval || config.DEFAULT_WAIT_BETWEEN_TX_MS);
  await WETHToDAI(ETH, DAIToDraw, options);
}

async function WETHToDAI(ETH, DAI, options) {
  var hash = await WETHToPETH(ETH, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval || config.DEFAULT_WAIT_BETWEEN_TX_MS);
  await PETHToDAI(ETH, DAI, options);
}

async function PETHToDAI(ETH, DAI, options) {
  var hash = await PETHToCDP(ETH, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval ? options.waitInterval : config.DEFAULT_WAIT_BETWEEN_TX_MS);
  hash = await CDPToDAI(DAI, options);
  await waitTillMined(hash, options);
}

async function CDPToETH(ETH, options) {
  hash = await CDPToPETH(ETH, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval ? options.waitInterval : config.DEFAULT_WAIT_BETWEEN_TX_MS);
  await PETHToETH(ETH, options);
}

async function PETHToETH(ETH, options) {
  var hash = await PETHToWETH(ETH, options);
  await waitTillMined(hash, options);
  await wait(options.waitInterval || config.DEFAULT_WAIT_BETWEEN_TX_MS);
  hash = await WETHToETH(ETH, options);
  await waitTillMined(hash, options);
}

async function ETHToWETH(value, options) {
    log("Converting " + value + " ETH to " + value + " WETH...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var WETH = getWeb3(options).eth.contract(config.WETH_ABI[networkId]);
    var WETH_instance = WETH.at(config.WETH_address[networkId]);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.WETH_address[networkId],value,options.privateKey,undefined,options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function WETHToETH(value, options) {
    log("Converting " + value + " WETH to " + value + " ETH...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var WETH = getWeb3(options).eth.contract(config.WETH_ABI[networkId]);
    var WETH_instance = WETH.at(config.WETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = WETH_instance.withdraw.getData(wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.WETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function WETHToPETH(value, options) {
    log("Converting " + value + " WETH to " + value + " PETH...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.join.getData(wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function PETHToWETH(value, options) {
    log("Converting " + value + " PETH to " + value + " WETH...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.exit.getData(wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function PETHToCDP(value, options) {
    log("Depositing " + value + " PETH to CDP with ID " + options.cdpId + "...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.lock.getData(numStringToBytes32(options.cdpId), wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function CDPToDAI(value, options) {
    log("Drawing " + value + " DAI from CDP with ID " + options.cdpId + "...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.draw.getData(numStringToBytes32(options.cdpId), wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function CDPToPETH(value, options) {
    log("Withdrawing " + value + " PETH from CDP with ID " + options.cdpId + "...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.free.getData(numStringToBytes32(options.cdpId), wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}

async function DAIToCDP(value, options) {
    log("Funding CDP with ID " + options.cdpId + " with " + value + " DAI...", options);
    var networkId = options.networkId ? new String(options.networkId) : new String(config.DEFAULT_NETWORK_ID);
    var PETH = getWeb3(options).eth.contract(config.PETH_ABI[networkId]);
    var PETH_instance = PETH.at(config.PETH_address[networkId]);
    var wei = getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT);
    var data = PETH_instance.wipe.getData(numStringToBytes32(options.cdpId), wei);
    var tx = await createTransaction(getAddressFromPrivateKey(options.privateKey),config.PETH_address[networkId],0,options.privateKey, data, options);
    var hash = await sendRawTransaction(tx.stx, options);
    return hash;
}


async function sendRawTransaction(stx, options) {
  const response = await getWeb3(options).eth.sendRawTransaction('0x' + stx.toString('hex'));
  return response;
}

async function createTransaction(source,destination,value,privateKey,data,options) {
  const transactionCount = await getWeb3(options).eth.getTransactionCount(source, 'pending');
  const gasPrice = options.gasPrice || getWeb3(options).eth.gasPrice;
  const gasPriceHex = getWeb3(options).toHex(gasPrice);
  const gasLimitHex = getWeb3(options).toHex(options.gasLimit || config.DEFAULT_GAS_LIMIT);
  const value_hex = getWeb3(options).toHex(getWeb3(options).toWei(value, config.DEFAULT_VALUE_UNIT));
  const nonce = getWeb3(options).toHex(transactionCount);
  var key = Buffer.from(privateKey, 'hex');
  var tra = {
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      from: source,
      to: destination,
      value: value_hex,
      nonce: nonce
  };
  if (data) tra["data"] = data;
  var tx = new Tx(tra);
  tx.sign(key);
  var stx = tx.serialize();
  return {stx: stx, tra: tra};
}

function getWeb3(options) {
  return options.web3 || getInfuraWeb3(options);
}

function getInfuraWeb3(options) {
  return options.networkId == 1 ? new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/')) : new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/'));
}

function numStringToBytes32(num) {
   var bn = new BN(num).toTwos(256);
   return padToBytes32(bn.toString(16));
}

function bytes32ToNumString(bytes32str) {
    bytes32str = bytes32str.replace(/^0x/, '');
    var bn = new BN(bytes32str, 16).fromTwos(256);
    return bn.toString();
}

function padToBytes32(n) {
    while (n.length < 64) {
        n = "0" + n;
    }
    return "0x" + n;
}

function getAddressFromPrivateKey(privateKey) {
  const wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
  return wallet.getChecksumAddressString();
}

function log(msg, options) {
  if (options.verbose == undefined || options.verbose == true) console.log(msg);
}

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  DAIToETH: DAIToETH,
  ETHToDAI: ETHToDAI,
  ETHToWETH: ETHToWETH,
  WETHToPETH: WETHToPETH,
  PETHToCDP: PETHToCDP,
  CDPToDAI: CDPToDAI,
  DAIToCDP: DAIToCDP,
  CDPToPETH : CDPToPETH,
  WETHToDAI: WETHToDAI,
  PETHToDAI: PETHToDAI,
  CDPToETH: CDPToETH,
  PETHToETH: PETHToETH,
  WETHToETH: WETHToETH,
  PETHToWETH: PETHToWETH
}
