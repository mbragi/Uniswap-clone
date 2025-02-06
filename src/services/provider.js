import { ethers } from "ethers";

const chains = {
  localhost: 1337,
  goerli: 5,
  ethereum: 1,
};

console.log(chains);
const getChainId = async (provider) => {
  const currentChain = await provider.getNetwork();
  return await currentChain.chainId;
};

export const switchToNetwork = async (selectedNetwork, provider) => {
  const currentChainId = await getChainId(provider);
  if (currentChainId !== chains[selectedNetwork]) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexValue(chains[selectedNetwork]) }],
      });
      window.reload()
    } catch (error) {
      console.log(error.message);
      if (error.code === 4902 || 32603 ) {
        console.log("need to add network");
        await addNetwork(selectedNetwork);
      }
    }
  }
};
const addNetwork = async (chain) => {
  let networksConfig = {
    localhost: {
      chainId: ethers.utils.hexValue(chains[chain]),
      chainName: "Hardhat Fork",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: "http://localhost:8545",
    },
  };
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [networksConfig[chain]],
    });
  } catch (addError) {
    // handle "add" error
    console.log(addError.message, `error occurred adding network ${chain} `);
  }
};

export const connectToNetwork = async (selectedNetwork) => {
  try {
    const supportedNetwork = {
      localhost: process.env.REACT_APP_LOCALHOST_PROVIDER,
      goerli: process.env.REACT_APP_GOERLI_PROVIDER,
      mainnet: process.env.REACT_APP_MAINNET_PROVIDER,
    };
    if (selectedNetwork === "localhost") {
      alert("Ensure your Mainnet fork is started on localhost");
      const web3Provider = await new ethers.providers.JsonRpcProvider(
        supportedNetwork[selectedNetwork.toLowerCase()]
      );
      return web3Provider;
    }
    const web3Provider = new ethers.providers.JsonRpcProvider(
      supportedNetwork[selectedNetwork.toLowerCase()]
    );
    return await web3Provider;
  } catch (error) {
    console.log("error connecting", error.message);
  }
};
//function to get signer
export const getSigner = async (provider) => {
  provider.send("eth_requestAccounts", []);
  const sign = await provider.getSigner();
  console.log("getSigner", sign);
  return sign;
};
//function to get wallet Address
export const getWalletAddress = async (signer) => {
  const address = await signer.getAddress();
  return address;
  // const result = await wethContract.balanceOf(address);
  // setWethAmount(Number(ethers.utils.formatEther(result)));
  // const res = await uniContract.balanceOf(address);
  // setUniAmount(Number(ethers.utils.formatEther(res)));
};
