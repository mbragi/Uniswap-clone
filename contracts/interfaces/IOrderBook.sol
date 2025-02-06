// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IOrderBook {
	function getSwapOrder(address _account, uint256 _orderIndex) external view returns (
        address path0,
        address path1,
        address path2,
//        uint256 tokenDecimalsIn,
//        uint256 tokenDecimalsOut,
        uint256 amountIn,
        uint256 minOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    );

    function executeSingleSwapOrder(
        uint160,
        address,
        uint256,
        address payable) external;

    function executeMultipleSwapOrder(bytes calldata,
        address,
        uint256,
        address payable) external;
}