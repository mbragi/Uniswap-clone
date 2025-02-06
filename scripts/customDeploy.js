// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const { BigNumber, ethers } = require("ethers");
const {
  AlphaRouter,
  ChainId,
  SwapType,
} = require("@uniswap/smart-order-router");
const {
  TradeType,
  CurrencyAmount,
  Percent,
  Token,
  SupportedChainId,
} = require("@uniswap/sdk-core");
const hre = require("hardhat");
const ercAbi = require("../test/ercAbi");
const JSBI = require("jsbi");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function contractAt(name, address, provider) {
  let contractFactory = await hre.ethers.getContractFactory(name);
  if (provider) {
    contractFactory = contractFactory.connect(provider);
  }
  return await contractFactory.attach(address);
}

function countDecimals(x) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}

function fromReadableAmount(amount, decimals) {
  const extraDigits = Math.pow(10, countDecimals(amount));
  const adjustedAmount = amount * extraDigits;
  return JSBI.divide(
    JSBI.multiply(
      JSBI.BigInt(adjustedAmount),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))
    ),
    JSBI.BigInt(extraDigits)
  );
}

async function deployContract(name, args, label, options) {
  if (!options && typeof label === "object") {
    label = null;
    options = label;
  }

  let info = name;
  if (label) {
    info = name + ":" + label;
  }
  const contractFactory = await hre.ethers.getContractFactory(name);
  let contract;
  if (options) {
    contract = await contractFactory.deploy(...args, options);
  } else {
    contract = await contractFactory.deploy(...args);
  }
  const argStr = args.map((i) => `"${i}"`).join(" ");
  console.info(`Deploying ${info} ${contract.address} ${argStr}`);
  await contract.deployTransaction.wait();
  console.info("... Completed!");
  return contract;
}

async function sendTxn(txnPromise, label) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait();
  console.info(`... Sent! ${txn.hash}`);
  await sleep(1000);
  return txn;
}

function bigNumberify(n) {
  return BigNumber.from(n);
}

function expandDecimals(n, decimals) {
  return bigNumberify(n).mul(bigNumberify(10).pow(decimals));
}

const UNISWAP_PRICE_FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const EXCHANGE_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

const WETH_TOKEN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC_TOKEN = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_TOKEN = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const WBTC_TOKEN = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

async function deployContracts() {
  let signers = hre.ethers.getSigners();
  let [deployer, orderKeeper] = await signers;

  const customRouter = await deployContract("Router", []);
  const priceFeed = await deployContract("PriceFeed", [UNISWAP_PRICE_FACTORY]);
  const uniswapSwap = await deployContract("UniswapSwap", []);
  const orderBook = await deployContract("OrderBookExec", []);
  // const orderBook = await deployContract("OrderBook", [])
  await sendTxn(
    orderBook.initialize(
      EXCHANGE_ROUTER,
      customRouter.address,
      uniswapSwap.address,
      WETH,
      priceFeed.address,
      "5000000000000000", // 0.005 ETH
      expandDecimals(10, 30)
    )
  );

  // called by admin only when a new orderBook contract is deployed
  await sendTxn(
    customRouter.addPlugin(orderBook.address),
    "customRouter.addPlugin"
  );
  await sendTxn(
    orderBook.setOrderKeeper(orderKeeper.address, true),
    "orderBook.setOrderKeeper"
  );

  return { orderBook, priceFeed, customRouter, uniswapSwap };
}

async function getPoolFee(tokenIn, tokenInDecimal, tokenOut, tokenOutDecimal) {
  // Get quote for the swap
  try {
    let quote = await generateSwapQuote(
      tokenIn,
      tokenInDecimal,
      tokenOut,
      tokenOutDecimal,
      10
    );
    let fees = quote.pools.map((x) =>
      x.token0.address === tokenIn && x.token1.address === tokenOut
        ? x.fee
        : 3000
    );
    return fees[0];
  } catch {
    return 3000;
  }
}

async function generateSwapQuote(
  tokenIn,
  tokenInDecimal,
  tokenOut,
  tokenOutDecimal,
  swapAmount
) {
  const TOKEN_IN = new Token(SupportedChainId.MAINNET, tokenIn, tokenInDecimal);

  const TOKEN_OUT = new Token(
    SupportedChainId.MAINNET,
    tokenOut,
    tokenOutDecimal
  );

  const router = new AlphaRouter({
    chainId: 1,
    provider: new hre.ethers.providers.JsonRpcProvider(
      "https://rpc.ankr.com/eth"
    ),
  });

  const options = {
    recipient: "0x06D1a662d2E8a7cD36302C3A0B28B74940Ee97e6",
    slippageTolerance: new Percent(50, 10_000),
    deadline: Math.floor(Date.now() / 1000 + 1800),
    type: SwapType.SWAP_ROUTER_02,
  };
  try {
    const route = await router.route(
      CurrencyAmount.fromRawAmount(
        TOKEN_IN,
        fromReadableAmount(swapAmount, TOKEN_IN.decimals).toString()
      ),
      TOKEN_OUT,
      TradeType.EXACT_INPUT,
      options
    );
    let suggestedPath = route.trade.routes[0].tokenPath || [];
    let pools = route.trade.routes[0].pools;

    return { suggestedPath, pools };
  } catch {
    return { suggestedPath: [], pools: [{ sqrtRatioX96: 0 }] };
  }
}

async function main() {
  let signers = hre.ethers.getSigners();
  let [deployer] = await signers;
  let poolFee = await getPoolFee(WETH_TOKEN, 18, USDT_TOKEN, 6);

  const { orderBook, priceFeed, customRouter, uniswapSwap } =
    await deployContracts();
  // // console.log("poolfee--->", poolFee);
  console.log("orderBook--->", orderBook.address);
  console.log("priceFeed--->", priceFeed.address);
  console.log("customRouter--->", customRouter.address);
  console.log("uniswapSwap--->", uniswapSwap.address);

  //frontend
  let tokenToSwap = new ethers.Contract(WETH_TOKEN, ercAbi, deployer);

  console.log(
    "before allowance",
    await tokenToSwap.allowance(deployer.address, customRouter.address)
  );

  // called by user when creating order ----> (Frontend)
  await sendTxn(
    tokenToSwap.approve(customRouter.address, ethers.constants.MaxInt256),
    "tokenToSwap.approve"
  );
  console.log(
    "after allowance",
    await tokenToSwap.allowance(deployer.address, customRouter.address)
  );
  // called by user only when a new orderBook contract is deployed ----> (Frontend)
  await sendTxn(
    customRouter.approvePlugin(orderBook.address),
    "customRouter.approvePlugin"
  );

  // called by admin personally when new token is added to exchange
  await sendTxn(
    orderBook.approve(WETH_TOKEN, EXCHANGE_ROUTER, ethers.constants.MaxInt256),
    "orderBook.approve"
  );

  // // called by user to create a trade ----> (Frontend)
  await sendTxn(
    orderBook.createSwapOrder(
      [WETH_TOKEN, USDT_TOKEN], // Order to swap from WETH to USDT
      [18, 6],
      hre.ethers.utils.parseEther("5"), // 1500
      0,
      "1672430000000000000000000000000000", // 1 ETH / 1 USDT = 0.00061 ETH = 1,640.49 *10^30
      false,
      "5000000000000000", // 0.005 eth
      true,
      false,
      poolFee,
      { value: hre.ethers.utils.parseEther("5.005") } // add gas fee to amount in if its in native eth
    ),
    "orderBook.createSwapOrder"
  );

  // Get the order you just created (Frontend)
  let swapOrder = await orderBook.getSwapOrder(deployer.address, 0);
  console.log("swapOrder ", swapOrder);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
