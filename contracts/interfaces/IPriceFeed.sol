// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IPriceFeed {
    function getAmmPrice(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256[] memory tokenDecimals
    ) external view returns (uint256, uint256);
}
