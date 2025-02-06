require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1337,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        },
      },
    ],
    // version: "0.8.17",
  },
  path: {
    artifacts: "./src/artifacts",
  },
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: "https://eth-mainnet.g.alchemy.com/v2/pUeiJ7eVVtFLV0DI5o0NISsG-XLwJceS",
      },
      chainId: 1337,
    },
    // goerliTestnet: {
    //   url: "https://rpc.ankr.com/eth_goerli",
    //   gasPrice: 10000000000,
    //   chainId: 5,
    //   accounts: [""]
    // }
  },
  // etherscan: {
  //     apiKey : ""
  //     }
};
