// Import necessary dependencies
import axios from "axios";
import { BigNumber, ethers, utils } from "ethers";
import React, { useEffect, useState } from "react";
// import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { VscGear } from "react-icons/vsc";
// import { parseUnits } from "ethers/lib/utils";
// import { BsArrowDownUp } from "react-icons/bs";
import { StyledButton, StyledForm } from "./FormComponents";
import orderBook from "../artifacts/contracts/OrderBookExec.sol/OrderBookExec.json";
import router from "../artifacts/contracts/Router.sol/Router.json";
import ERC20_ABI from "../artifacts/ercAbi.json";
import { customRouter, OrderBookExec } from "../services/ContractAddress";
import { getCoinPriceInUSD, getPoolFee } from "../services/helpers";
// import Loading from "../Utils/Loading";
import OrderHistory from "./OrderHistory";
// import ErrorPage from "../Utils/ErrorPage";
import "../App.css";



// Define a functional component called 'TokenSwapUi'
function TokenSwapUi(props) {
  // Declare state variables
  const { signer, isConnected, network, address, provider } = props
  localStorage.setItem("network", network)
  const [fromToken, setFromToken] = useState({});
  const [toToken, setToToken] = useState({});
  const [amount, setAmount] = useState("");
  const [exchangeAmount, setExchangeAmount] = useState("");
  const [price, setPrice] = useState(null);
  const [price2, setPrice2] = useState(null);
  const [limit, setLimit] = useState("0.00");
  const [tokenList, setTokenList] = useState([]);
  const [minOut, setMinOut] = useState(0);
  const [isApprove, setIsApprove] = useState(false);
  // const [displayFromTokens, setDisplayFromTokens] = useState(false)
  // const [displayToTokens, setDisplayToTokens] = useState(false)
  // const [isLoading, setIsLoading] = useState(false);
  const [isSwap, setIsSwap] = useState(false);
  const [approvedPlugin, setApprovedPlugin] = useState(false)
  const [swapData, setSwapData] = useState([]);
  const [orderIndex, setOrderIndex] = useState(0);
  const [orderExec, setOrderExec] = useState(undefined)
  const [routerI, setRouterI] = useState(undefined)

  const objOfAddressArray = {
    localhost: {
      customRouter: customRouter,
      orderBook: OrderBookExec
    },
    goerli: {
      customRouter: "0x3f7Ab8038EA9598109E238dCE231986517ec7E66",
      orderBook: "0x69f49aD77f915CA4d5F5487b77904684c3ADb0EB"
    }
  }
  const contractInstances = async () => {
    // Create contract instances for the router and orderbook contracts
    const selectedNetworkAddress = objOfAddressArray[network]
    const RouterContract = new ethers.Contract(
      selectedNetworkAddress.customRouter,
      router.abi,
      provider
    )

    const orderBookContract = new ethers.Contract(
      selectedNetworkAddress.orderBook,
      orderBook.abi,
      provider
    )
    console.log(RouterContract, orderBookContract)
    setOrderExec(orderBookContract)
    setRouterI(RouterContract)
    return
  }
  // Function to handle change in 'from' token
  const handleFromTokenChange = async (e) => {
    const getTokenObj = tokenList.find((token) => token.id === e.target.value);
    // Use Coingecko API to get price of the selected token
    if (network === "goerli") {
      const name = getTokenObj.name === "Wrapped Ether" ? "ethereum" : getTokenObj.name.split(" ")[0].toLowerCase()
      const getPrice = await getCoinPriceInUSD(name)
      setPrice(getPrice);
      setFromToken(getTokenObj);
      return
    }
    const getPrice = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${getTokenObj.id}&vs_currencies=usd`
    );

    // Update the state variables with the new values
    let price = ethers.utils.commify(getPrice.data[getTokenObj.id].usd);
    setPrice(price);
    setFromToken(getTokenObj);
  };

  // Function to handle change in 'to' token
  const handleToTokenChange = async (e) => {
    const getTokenObj = tokenList.find((token) => token.id === e.target.value);

    // Use Coingecko API to get price of the selected token
    if (network === "goerli") {
      const name = getTokenObj.name === "Wrapped Ether" ? "ethereum" : getTokenObj.name.split(" ")[0].toLowerCase()
      const getPrice = await getCoinPriceInUSD(name)
      setPrice2(getPrice);
      setToToken(getTokenObj);
      return
    }
    // Use Coingecko API to get price of the selected token
    const getPrice = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${getTokenObj.id}&vs_currencies=usd`
    );

    // Update the state variables with the new values
    let price = ethers.utils.commify(getPrice.data[getTokenObj.id].usd);
    setPrice2(price);
    setToToken(getTokenObj);
  };

  // Function to handle change in amount to swap
  const handleAmountChange = (e) => {
    if (toToken.decimals === undefined)
      return alert("Please select a token to swap ");
    if (network === "goerli") {
      let sell = price
      let buy = price2
      let displayAmount = ((e.target.value * sell) / buy).toFixed(6);
      console.log(displayAmount);
      setAmount(displayAmount);
      setExchangeAmount(e.target.value);
      return
    }
    let sell = price.replace(",", "")
    let buy = price2.replace(",", "")
    let displayAmount = ((e.target.value * sell) / buy).toFixed(6);
    console.log(displayAmount);
    setAmount(displayAmount);
    setExchangeAmount(e.target.value);
  };

  let selectedNetwork = objOfAddressArray[network]
  // Function to approve orderbook on the router contract
  async function approveOrderBookExecAsPlugin(e) {
    e.preventDefault()
    try {
      await routerI.connect(signer).approvePlugin(selectedNetwork.orderBook);
      console.log(
        "OrderBookExec has been approved as a plugin on the RouterContract."
      );
      setApprovedPlugin(true)
    } catch (error) {
      console.error(
        "Error while approving OrderBookExec as a plugin on the RouterContract:",
        error
      );
    }
  }

  // Function to set limit trade and update the amount state
  async function setLimitTrade(e) {
    if (network === "goerli") {
      let sell = price
      let limit = (sell / e.target.value) * exchangeAmount;
      setLimit(e.target.value);
      console.log(limit);
      setAmount(limit.toFixed(6));
      return
    }
    let sell = price.replace(',', '')
    let limit = (sell / e.target.value) * exchangeAmount;
    setLimit(e.target.value);
    console.log(limit);
    setAmount(limit.toFixed(6));
  }

  // Function to get the swap order from the orderbook
  async function getSwapOrder(number) {
    try {
      console.log("orderbook contract", orderExec);
      let data = await orderExec.getSwapOrder(address, number);
      // console.log("data", data);
      setIsSwap(true);
      setSwapData([...swapData, data]);
      return data;
    } catch (error) {
      console.log("error", error.message);
      alert("An error occurred retrieving swap data!");
    }
  }

  //Approve SwapToken
  const approveToken = async (e) => {
    e.preventDefault();
    let selectedNetwork = objOfAddressArray[network]
    if (fromToken.id === undefined) {
      return alert("Please select a token to swap");
    }

    // Check if Metamask is connected
    if (!isConnected()) {
      return alert('Connect wallet to proceed')
    }

    if (network === undefined) {
      return alert("select a chain Network to proceed")
    }

    const tokenToSwapContract = new ethers.Contract(
      fromToken.id,
      ERC20_ABI,
      provider
    )
    await contractInstances()
    const already_been_approved = await tokenToSwapContract.allowance(
      address,
      selectedNetwork.customRouter
    );
    if (already_been_approved.toString() > 0) {
      console.log("Token has been approved");
      console.log(already_been_approved.toString());
      setIsApprove(true);
      const balanceOfAccount = await tokenToSwapContract.balanceOf(address);
      console.log(Number(ethers.utils.formatEther(balanceOfAccount)))
      return;
    }

    // Approve the token to be swapped
    await tokenToSwapContract.connect(signer).approve(
      selectedNetwork.customRouter,
      ethers.constants.MaxUint256
    )

    // Check if the token has been approved
    const is_approved = await tokenToSwapContract.allowance(
      address,
      selectedNetwork.customRouter
    );
    if (is_approved.toString() !== 0) {
      console.log("Token is been approved");
      console.log(is_approved.toString());
      setIsApprove(true);
      const balanceOfAccount = await tokenToSwapContract.balanceOf(address);
      console.log(Number(ethers.utils.formatEther(balanceOfAccount)))
    }
    return;
  };

  // Function to swap tokens
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all fields are filled
    if (!amount || !limit || !toToken.id || !fromToken.id) {
      return alert("all fields are required");
    }
    // Get the pool fee for the given token pair
    const poolFee = await getPoolFee(
      fromToken.id,
      fromToken.decimals,
      toToken.id,
      toToken.decimals
    );
    let fee = await poolFee;
    console.log(await poolFee);

    // Create a contract instance for the token being swapped
    const tokenToSwapContract = new ethers.Contract(
      fromToken.id,
      ERC20_ABI,
      provider
    )

    // Check if the token has been approved for trading on the router contract
    const data = await tokenToSwapContract.allowance(address, selectedNetwork.customRouter);
    const defaultValue = "0";
    if (data.toString() === defaultValue) {
      // Approve the token first
      setIsApprove(false);
      return alert("Please approve token first");
    }

    // Convert the limit value to a BigNumber and calculate the trigger ratio
    const sanitizedValue = limit.replace(/,/g, "");
    console.log(data.toString());
    if (!BigNumber.isBigNumber(sanitizedValue.toString())) {
      const ratio = BigNumber.from(parseFloat(sanitizedValue));
      const triggerRatio = ratio.mul(BigNumber.from(10).pow(30));
      if (localStorage.getItem("index") === null || undefined) {
        localStorage.setItem("index", JSON.stringify(orderIndex));
      } else {
        let index = JSON.parse(localStorage.getItem("index"));
        index = index + 1;
        localStorage.setItem("index", JSON.stringify(index));
      }
      console.log("triggerRatio", triggerRatio.toString());
      // Create a swap order on the orderbook contract
      console.log(
        "Creating swap order...",
        ethers.utils.parseEther(exchangeAmount).toString()
      );
      const newIndex = JSON.parse(localStorage.getItem("index"));
      if (newIndex === 10) {
        return alert('maximum transactions reached')
      }
      try {
        if (fromToken.symbol === "WETH") {
          let amount_to_send = parseFloat(exchangeAmount) + parseFloat(".005")
          let data = await orderExec.connect(signer).createSwapOrder(
            [fromToken.id, toToken.id],
            [fromToken.decimals, toToken.decimals],
            ethers.utils.parseEther(exchangeAmount),
            minOut,
            triggerRatio,
            false,
            utils.parseEther(".005").toString(),
            true, // should wrap true if using native eth token
            false,
            fee,
            {
              value: utils.parseEther(amount_to_send.toFixed(6)),
            }
          );
          console.log(await data);
          await data.wait();
        } else {
          let data = await orderExec.connect(signer).createSwapOrder(
            [fromToken.id, toToken.id],
            [fromToken.decimals, toToken.decimals],
            ethers.utils.parseEther(exchangeAmount),
            minOut,
            triggerRatio,
            false,
            utils.parseEther(".005").toString(),
            false, // should wrap true if using native eth token
            false,
            fee,
            {
              value: utils.parseEther(".005"),
            }
          );
          // console.log(await data);
          await data.wait();
        }
      } catch (error) {
        console.log("Error creating swap order:", error.message);
        return alert("Error creating swap order. Please try again later.");
      }
      let swapOrder = await getSwapOrder(orderIndex);
      console.log(swapOrder);
      alert("Swap order created successfully");
      setOrderIndex(newIndex);
    }

    // Reset the input values
    setAmount(0);
    setToToken("select token");
    setFromToken("select token");
    setLimit(0);
    setIsApprove(true);
    setPrice2(null);
    setPrice(null);
  };

  // Function to get available tokens from the queryClient

  // // console.log("formattedTokens", formattedTokens);
  // queryClient.setQueryData("displayTokens", formattedTokens);

  useEffect(() => {
    const arr = [{
      id: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18
    },
    {
      id: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      name: "Uniswap Token",
      symbol: "UNI",
      decimals: 18
    }]
    let obj = {
      localhost: props.data,
      goerli: arr,
      undefined: props.data
    }
    setOrderIndex(1);
    setTokenList(obj[network]);
    setMinOut(0);
  }, [network, props.data]);


  return (
    <>
      <div className="py-[3rem] animate-change">
        {isApprove ?
          (
            <AppBody >
              <SwapContainer className="w-[60%] lg:w-[45%]">
                <SwapHeader>
                  <SwapLink1 className="nav-link active" to="/limit">
                    Limit SwapOrder
                  </SwapLink1>
                  <VscGear className="gear" />
                </SwapHeader>
                <div className="swapBody">
                  <StyledForm className="token-swap-form">
                    <CurrencyInput>
                      <Sell className="nav-link active" to="/sell">
                        You sell
                      </Sell>
                      <select
                        className="token-swap-select custom-select text-white bg-body2  p-3 w-[42%] rounded-md"
                        defaultValue={fromToken.name}
                        onChange={handleFromTokenChange}
                      // onClick={() => setDisplayFromTokens(true)}
                      >
                        {/* {
                          displayFromTokens && <> hello bitch</>
                        } */}
                        <option value="BTC" hidden>
                          Select Token
                        </option>
                        {tokenList.map((token) => {
                          // console.log(token)
                          return (
                            <option
                              key={token.id}
                              value={token.id}
                              defaultValue={fromToken.name}
                            >
                              {token.name}
                            </option>
                          )
                        })}
                      </select>
                      <input
                        type="number"
                        className="custom-input bg-inherit p-3 border-transparent  ml-2 text-white w-[50%]"
                        onChange={handleAmountChange}
                        placeholder="0.00"
                      />
                      {price !== null && (
                        <p
                          className="w-full m-4 text-white "
                          defaultValue={price}
                        >
                          ${price}
                        </p>
                      )}
                    </CurrencyInput>
                    <div className="icon py-4">
                      {/* <BsArrowDownUp /> */}
                    </div>
                    <CurrencyInput1>
                      <Sell1 className="nav-link active" to="/buy">
                        You buy
                      </Sell1>
                      <select
                        defaultValue={toToken.name}
                        onChange={handleToTokenChange}
                        className="token-swap-select custom-select  p-3 bg-body2 text-white w-[40%] rounded-md"
                      >
                        <option value="BTC" hidden>
                          Select Token
                        </option>
                        {tokenList.map((token) => {
                          return (
                            <option
                              key={token.id}
                              value={token.id}
                              defaultValue={toToken.name}
                            >
                              {token.name}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        type="none"
                        className="custom-input bg-inherit p-3  ml-2 text-white w-[50%]"
                        defaultValue={amount}
                        placeholder="0.00"
                      />
                    </CurrencyInput1>
                    <CurrencyInput2>
                      <label className=" text-white font-bold">Set Limit</label>
                      <input
                        className="custom-input bg-inherit text-left  py-3 rounded-md text-white w-[100%]"
                        defaultValue={limit}
                        placeholder="$ 100"
                        onChange={setLimitTrade}
                      />
                    </CurrencyInput2>
                    <CurrencyInput3>
                      <label className=" text-white font-bold">Price</label>
                      {price2 !== null && (
                        <p
                          className="font-sm text-xs text-white p-3 w-full"
                          defaultValue={` ${toToken.symbol} = $ ${price2}{" "}`}
                        >
                          {" "}
                          {toToken.symbol} = $ {price2}{" "}
                        </p>
                      )}
                    </CurrencyInput3>
                    {
                      approvedPlugin ?
                        <StyledButton type="submit" onClick={handleSubmit} className="token-swap-button">
                          Swap Tokens
                        </StyledButton> :
                        <StyledButton onClick={approveOrderBookExecAsPlugin} className="token-swap-button">
                          Approve Tokens Plugin
                        </StyledButton>
                    }
                  </StyledForm>
                </div>
              </SwapContainer>
            </AppBody>
          ) : (
            <AppBody >
              <SwapContainer>
                <SwapHeader>
                  <SwapLink1 className="nav-link active" to="/limit">
                    Limit SwapOrder
                  </SwapLink1>
                  <VscGear className="gear" />
                </SwapHeader>
                <div className="swapBody">
                  <StyledForm onSubmit={approveToken} className="token-swap-form">
                    <CurrencyInput>
                      <Sell className="nav-link active" to="/sell">
                        You sell
                      </Sell>
                      <select
                        className="token-swap-select custom-select text-white bg-body2  p-3 w-[42%] rounded-md"
                        defaultValue={fromToken.name}
                        onChange={handleFromTokenChange}
                      >
                        <option value="BTC" hidden>
                          Select Token
                        </option>
                        {tokenList.map((token) => {
                          // console.log(token)
                          return (
                            <option key={token.id} value={token.id}>
                              {token.name}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        className="custom-input bg-inherit p-3 border-transparent  ml-2 text-white w-[50%]"
                        onChange={handleAmountChange}
                        placeholder="0.00"
                      />
                      {price !== null && (
                        <p className="w-full m-4 text-white ">${price}</p>
                      )}
                    </CurrencyInput>
                    <div className="icon py-4">
                      {/* <BsArrowDownUp /> */}
                    </div>
                    <CurrencyInput1>
                      <Sell1 className="nav-link active" to="/buy">
                        You buy
                      </Sell1>
                      <select
                        defaultValue={toToken.name}
                        onChange={handleToTokenChange}
                        className="token-swap-select custom-select  p-3 bg-body2 text-white w-[40%] rounded-md"
                      >
                        <option value="BTC" hidden>
                          Select Token
                        </option>
                        {tokenList.map((token) => {
                          return (
                            <option key={token.id} value={token.id}>
                              {token.name}
                            </option>
                          );
                        })}
                      </select>
                      <input
                        className="custom-input bg-inherit p-3  ml-2 text-white w-[50%]"
                        defaultValue={amount}
                        placeholder="0.00"
                      />
                    </CurrencyInput1>

                    <StyledButton type="submit" className="token-swap-button animate-pulse">
                      Approve Token
                    </StyledButton>
                  </StyledForm>
                </div>
              </SwapContainer>
            </AppBody>
          )
        }
      </div>
      {isSwap && <OrderHistory data={swapData} network={network} />}
    </>
  );
}

export default TokenSwapUi;

const AppBody = styled.div`
  overflow: hidden;
  width: 100%;
  padding-top: 25px;
`;

const SwapContainer = styled.div`
  background-color: #131823;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba (0, 0, 0, 0.25);
  // min-width: 350px;
  // width: 45%;
  // height: 530px;
  min-height: 100px;
  margin: 0 auto;
  top: 50%;
  border-radius: 24px;
  padding: 16px;
  display: block;
`;

const SwapHeader = styled.div`
  text-align: left;
  padding: 4px 20px 0px 20px;
`;

// const SwapLink = styled(Link)`
//   color: #fff;
//   font-size: 20px;
//   margin: 15px;
//   font-weight: 600;
// `;
const SwapLink1 = styled(Link)`
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  &:hover {
    color: #a0a7ad;
  }
`;

const CurrencyInput = styled.div`
  background-color: #06070a;
  height: 100px;
  margin: 13px !important;
  margin-top: 30px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput1 = styled.div`
  background-color: #06070a;
  height: 100px;
  margin: 10px !important;
  margin-top: 3px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput2 = styled.div`
  background-color: #06070a;
  height: 100px;
  width: 200px;
  margin: 10px !important;
  margin-top: 3px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const CurrencyInput3 = styled.div`
  background-color: #06070a;
  height: 100px;
  width: 150px;
  margin: 10px !important;
  margin-top: -112px !important;
  margin-left: 225px !important;
  padding: 15px;
  border-radius: 20px;
  background: linear-gradient(
    315deg,
    #06070a 2%,
    #06080c 30%,
    rgb(1, 1, 20) 100%,
    rgba(15, 15, 30, 0.5) 100%
  );
  animation: gradient 5s ease infinite;
`;

const Sell = styled.div`
  color: #a0a7ad;
  width: 100%;
  font-size: 14px;
  margin-right: 420px;
  &:hover {
    color: #fff;
  }
`;

const Sell1 = styled.div`
  color: #a0a7ad;
  width: 100%;
  font-size: 14px;
  margin-right: 420px;

  &:hover {
    color: #fff;
  }
`;

// const icon = styled.div`
//   color: #a0a7ad;
// `;
