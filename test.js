const index = require('./index');
const Web3 = require('web3');

(async function() {
  index.DAIToETH(20, {
    privateKey: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    cdpId: 614
  });
})();
