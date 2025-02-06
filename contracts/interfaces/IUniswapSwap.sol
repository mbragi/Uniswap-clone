// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.11 <=0.8.17;
pragma experimental ABIEncoderV2;
import "./ISwapRouter.sol";


interface IUniswapSwap {
    function swapExactInputSingleHop(
        address tokenIn,
        address tokenOut,
        uint24 poolFee,
        uint amountIn,
        uint amountOutMinimum,
        uint160 sqrtPriceLimitX96,
        address recipient
    ) external view returns (ISwapRouter.ExactInputSingleParams memory params);

    function swapExactInputMultiHop(
        bytes calldata path,
        uint amountIn,
        uint amountOutMinimum,
        address recipient
    ) external view returns (ISwapRouter.ExactInputParams memory params);
}
