import { BigNumber, FixedNumber, ethers } from "ethers";
import axios from "axios";
import JSBI from "jsbi";
const {
  TradeType,
  CurrencyAmount,
  Percent,
  Token,
  SupportedChainId,
} = require("@uniswap/sdk-core");
const { AlphaRouter, SwapType } = require("@uniswap/smart-order-router");
export function countDecimals(x) {
  if (Math.floor(x) === x) {
    return 0;
  }
  return x.toString().split(".")[1].length || 0;
}

export function expandDecimals(n, decimals) {
  return bigNumberify(n).mul(bigNumberify(10).pow(decimals));
}
export function convertToBigNumber(n, decimals) {
  let amount = FixedNumber.from();
  console.log("amount", amount);
  // return amount.toNumber(n).div(amount.from(10).pow(decimals));
}
export function fromReadableAmount(amount, decimals) {
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

function bigNumberify(n) {
  return BigNumber.from(n).toString();
}

export async function sendTxn(txnPromise, label) {
  const txn = await txnPromise;
  console.info(`Sending ${label}...`);
  await txn.wait();
  console.info(`... Sent! ${txn.hash}`);
  // await sleep(1000);
  return txn;
}

export async function getPoolFee(
  tokenIn,
  tokenInDecimal,
  tokenOut,
  tokenOutDecimal
) {
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

export const getCoinPriceInUSD = async (coin = "ethereum") => {
  return await axios
    .get(`https://api.coingecko.com/api/v3/coins/${coin}`)
    .then(function (response) {
      console.log(response?.data?.market_data?.current_price?.usd);
      return response?.data?.market_data?.current_price?.usd;
    })
    .catch(function (error) {
      console.log(error?.response?.data);
    });
};

async function generateSwapQuote(
  tokenIn,
  tokenInDecimal,
  tokenOut,
  tokenOutDecimal,
  swapAmount
) {
  const TOKEN_IN = new Token(SupportedChainId.GOERLI, tokenIn, tokenInDecimal);

  const TOKEN_OUT = new Token(
    SupportedChainId.GOERLI,
    tokenOut,
    tokenOutDecimal
  );

  const router = new AlphaRouter({
    chainId: 1,
    provider: new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth"),
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
