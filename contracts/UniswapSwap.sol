// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.11 <=0.8.17;
pragma experimental ABIEncoderV2;

import "./libraries/math/SafeMath.sol";
import "./libraries/token/IERC20.sol";
import "./libraries/token/SafeERC20.sol";
import "./libraries/utils/Address.sol";
import "./libraries/utils/ReentrancyGuard.sol";

import "./interfaces/IRouter.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IUniswapSwap.sol";

contract UniswapSwap is IUniswapSwap {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    function swapExactInputSingleHop(
        address tokenIn,
        address tokenOut,
        uint24 poolFee,
        uint amountIn,
        uint amountOutMinimum,
        uint160 sqrtPriceLimitX96,
        address recipient
    ) override external view returns (ISwapRouter.ExactInputSingleParams memory params) {

        params = ISwapRouter.ExactInputSingleParams({
        tokenIn : tokenIn,
        tokenOut : tokenOut,
        fee : poolFee,
        recipient : recipient,
        deadline : block.timestamp,
        amountIn : amountIn,
        amountOutMinimum : amountOutMinimum,
        sqrtPriceLimitX96 : sqrtPriceLimitX96
        });
        return params;
    }

    function swapExactInputMultiHop(
        bytes calldata path,
        uint amountIn,
        uint amountOutMinimum,
        address recipient
    ) override external view returns (ISwapRouter.ExactInputParams memory params) {

        params = ISwapRouter.ExactInputParams({
        path : path,
        recipient : recipient,
        deadline : block.timestamp,
        amountIn : amountIn,
        amountOutMinimum : amountOutMinimum
        });

        return params;
    }
}
