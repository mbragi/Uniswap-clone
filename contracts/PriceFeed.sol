// SPDX-License-Identifier: MIT

import "./libraries/math/SafeMath.sol";
import "./libraries/math/FullMath.sol";

import "./interfaces/IPriceFeed.sol";
import "./interfaces/IUniswapV3Factory.sol";
import "./interfaces/IUniswapV3Pool.sol";

pragma solidity 0.6.12;

contract PriceFeed is IPriceFeed {
    using SafeMath for uint256;
    using FullMath for uint256;

    address public gov;
    uint256 public constant PRICE_PRECISION = 10 ** 30;
    uint256 public constant ONE_USD = PRICE_PRECISION;
    address public uniswapFactory;

    modifier onlyGov() {
        require(msg.sender == gov, "VaultPriceFeed: forbidden");
        _;
    }

    constructor(address _priceFactory) public {
        gov = msg.sender;
        uniswapFactory = _priceFactory;
    }

    function setGov(address _gov) external onlyGov {
        gov = _gov;
    }

    function setPriceFactory(address _priceFactory) external onlyGov {
        uniswapFactory = _priceFactory;
    }

    function getAmmPrice(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256[] memory tokenDecimals
    ) public override view returns (uint256, uint256) {
        address _factory = IUniswapV3Factory(uniswapFactory).getPool(tokenIn, tokenOut, fee);
        IUniswapV3Pool pool = IUniswapV3Pool(_factory);

        (uint160 sqrtPriceX96,,,,,,) = pool.slot0();
        address _token0 = pool.token0();
        address _token1 = pool.token1();

        (uint256 token0Price, uint256 token1Price) = getPairPrice(tokenIn, tokenOut, _token0, _token1, tokenDecimals, sqrtPriceX96);

        // We need the amount of output tokens 1 input token will produce
        // 1 Input token = X Output tokens
        uint256 tokenInPrice = address(tokenIn) == _token0 ? token0Price : token1Price;
        uint256 tokenOutPrice = address(tokenOut) == _token1 ? token1Price : token0Price;

        return (tokenInPrice, tokenOutPrice);
    }

    function getPairPrice(
        address tokenIn,
        address tokenOut,
        address _token0,
        address _token1,
        uint256[] memory tokenDecimals,
        uint160 sqrtPriceX96
    ) public pure returns (uint256, uint256) {

        uint256 tokenInDecimal = tokenDecimals[0];
        uint256 tokenOutDecimal = tokenDecimals[tokenDecimals.length - 1];

        uint256 decimalsToken0 = address(tokenIn) == _token0 ? tokenInDecimal : tokenOutDecimal;
        uint256 decimalsToken1 = address(tokenOut) == _token1 ? tokenOutDecimal : tokenInDecimal;

        uint256 priceX96 = uint256(sqrtPriceX96).mul(uint256(sqrtPriceX96));
        uint256 price = FullMath.mulDiv(priceX96, 10 ** decimalsToken0, 1 << 192);

        uint256 token0Price = price.mul(PRICE_PRECISION).div(10 ** decimalsToken1);
        uint256 token1Price = ONE_USD.mul(PRICE_PRECISION).div(token0Price);

        return (token0Price, token1Price);

    }
}