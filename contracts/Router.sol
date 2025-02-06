// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "./libraries/math/SafeMath.sol";
import "./libraries/token/SafeERC20.sol";
import "./libraries/token/IERC20.sol";
import "./libraries/utils/Address.sol";


import "./interfaces/IWETH.sol";
import "./interfaces/IRouter.sol";

contract Router is IRouter {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    address public gov;
    mapping (address => bool) public plugins;
    mapping (address => mapping (address => bool)) public approvedPlugins;

    modifier onlyGov() {
        require(msg.sender == gov, "Router: forbidden");
        _;
    }

    constructor() public {
        gov = msg.sender;
    }

    function setGov(address _gov) external onlyGov {
        gov = _gov;
    }

    function addPlugin(address _plugin) external override onlyGov {
        plugins[_plugin] = true;
    }

    function removePlugin(address _plugin) external onlyGov {
        plugins[_plugin] = false;
    }

    function approvePlugin(address _plugin) external {
        approvedPlugins[msg.sender][_plugin] = true;
    }

    function denyPlugin(address _plugin) external {
        approvedPlugins[msg.sender][_plugin] = false;
    }

    function pluginTransfer(address _token, address _account, address _receiver, uint256 _amount) external override {
        _validatePlugin(_account);
        IERC20(_token).safeTransferFrom(_account, _receiver, _amount);
    }

    function _sender() private view returns (address) {
        return msg.sender;
    }

    function _validatePlugin(address _account) private view {
        require(plugins[msg.sender], "Router: invalid plugin");
        require(approvedPlugins[_account][msg.sender], "Router: plugin not approved");
    }
}
