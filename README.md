# node-dai

* Convert ETH to DAI.
* Convert DAI to ETH.
* Fund your CDP with PETH.
* Draw DAI from your CDP.
* And much more...

The first comprehensive NPM module for the MakerDAO ecosystem.

Offers 14 different actions for programatically interacting with MakerDAO using Javascript and web3.

## Installation

```node
npm install node-dai --save
npm install web3@0.20.6 --save
```

## Prerequisites

* An open CDP
* All token allowances approved
* A little bit of MKR in your wallet (for paying fees)
* A [web3 instance](https://github.com/ethereum/web3.js/)

The first two can be obtained in a few minutes by heading to the MakerDAO dashboard: https://dai.makerdao.com/

MKR can be bought at OasisDEX: https://oasisdex.com/trade/MKR/DAI

Alternatively you can use a [public test account](#public-test-account) that is set up for use already.

## Examples

#### Deposit 1 ETH to CDP and draw 300 DAI:

```node
const nodeDai = require('node-dai');
const Web3 = require('web3');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  cdpId: 401, // The ID of your open CDP
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>')),
  DAIToDraw: 300 // Amount of DAI to draw from CDP
};
var ETH = 1;

(async function(){
  await nodeDai.ETHToDAI(ETH, options);
})();

```

#### Convert 200 DAI to ETH:

```node
const nodeDai = require('node-dai');
const Web3 = require('web3');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  cdpId: 401, // The ID of your open CDP
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>'))
};
var DAI = 200;

(async function(){
  await nodeDai.DAIToETH(DAI, options);
})();

```

#### Draw 200 DAI from CDP:

```node
const nodeDai = require('node-dai');
const Web3 = require('web3');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  cdpId: 401, // The ID of your open CDP
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>'))
};
var DAI = 200;

(async function(){
  await nodeDai.CDPToDAI(DAI, options);
})();

```

#### Deposit 200 DAI to CDP:

```node
const nodeDai = require('node-dai');
const Web3 = require('web3');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  cdpId: 401, // The ID of your open CDP
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>'))
};
var DAI = 200;

(async function(){
  await nodeDai.DAIToCDP(DAI, options);
})();

```

#### Convert 1 PETH to ETH:

```node
const nodeDai = require('node-dai');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>'))
};
var PETH = 1;

(async function(){
  await nodeDai.PETHToETH(PETH, options);
})();

```

#### Draw 1 PETH from CDP and convert to 1 ETH:

```node
const nodeDai = require('node-dai');

var options = {
  privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3', // Your private key
  cdpId: 401, // The ID of your open CDP
  networkId: 42, // Kovan Test Network, use 1 for Main Network
  web3: new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/<YOUR_INFURA_API_KEY>'))
};
var PETH = 1;

(async function(){
  await nodeDai.CDPToETH(PETH, options);
})();

```

## API

* nodeDai.ETHToDAI (ETH, options)
* nodeDai.DAIToETH (DAI, options)
* nodeDai.ETHToWETH (ETH, options)
* nodeDai.WETHToPETH (WETH, options)
* nodeDai.PETHToCDP (PETH, options)
* nodeDai.CDPToDAI (DAI, options)
* nodeDai.DAIToCDP (DAI, options)
* nodeDai.CDPToPETH (PETH, options)
* nodeDai.PETHToWETH (PETH, options)
* nodeDai.WETHToETH (WETH, options)
* nodeDai.CDPToETH (ETH, options)
* nodeDai.PETHToETH (PETH, options)
* nodeDai.WETHToDAI (WETH, options)
* nodeDai.PETHToDAI (PETH, options)


## Options

```json
    privateKey: Your private key, used for signing transactions. All transactions are signed locally.
    cdpId: The numeric ID of one of your open CDPs (e.g. 401)
    web3: Your web3 instance.
    networkId: The ID of the desired network. 1 for Main Network, 42 for Kovan Test Network. Default: 42
    DAIToDraw: Amount of DAI to draw from your CDP. Only relevant for method: ETHToDAI
    verbose: Whether to print to console or not. Default: true
    waitInterval: Amount of ms to wait inbetween transactions. Default:  10000
    gasLimit: Gas Limit for every transaction. Default:  300000
    requireConfirm: Require that every transaction receives 12 block confirmations before proceeding to next. Default: false
```

## Networks

* Main Network (network ID 1)
* Kovan Test Network (network ID 42)

It is recommended to test the module on Kovan first, before using it with the Main Network.

More test networks will be added soon.

## Public test account

If you prefer not to use your own account, you may instead use the Ganache mock account with

```json
  privateKey: c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
  seed: candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

This account is public, has an open CDP, some MKR and Kovan-ETH in its wallet and has set all permissions. It can be used for fast testing.

**DO NOT SEND REAL FUNDS TO THIS ACCOUNT. USE FOR TESTING ONLY.**

## Troubleshooting

* Ensure that you have enough MKR to pay the small fee necessary for interacting with a CDP.
* Ensure that you have enough ETH to pay for gas.
* Ensure that you have an open CDP and that you have passed along its ID in the options object.
* Ensure that you have set all permissions in the MakerDAO dashboard (WETH Join, WETH Mock, PETH Exit/Lock, PETH Boom, MKR Wipe/Shut, DAI Wipe/Shut, DAI Bust/Cash) .
* Ensure that you are on the right network (Kovan is the default network, pass along 1 as networkId to use the Main Network instead).
* Ensure that your private key is valid.
* Ensure that your web3 instance is valid and is configured to use the right network. You can use Infura for easy access: https://infura.io/
* Ensure that you are not overleveraging your CDP. You must always leave some collateral (PETH) behind when drawing DAI.

The MakerDAO dashboard can be accessed here: https://dai.makerdao.com/

## License

Copyright 2018 Kaisle

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Additional resources

For more information about MakerDAO visit: https://makerdao.com/

Access the MakerDAO dashboard at: https://dai.makerdao.com/

Access OasisDEX at: https://oasisdex.com/trade/MKR/DAI

## Contributing

```bash
  git clone https://github.com/Kaisle/node-dai.git && cd node-dai
  npm install
```

This module is still in its infancy. Any pull requests are welcome!
