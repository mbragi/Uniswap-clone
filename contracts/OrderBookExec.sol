// SPDX-License-Identifier: MIT
pragma solidity >=0.6.11 <=0.8.17;
pragma experimental ABIEncoderV2;

import "./libraries/math/SafeMath.sol";
import "./libraries/token/IERC20.sol";
import "./libraries/token/SafeERC20.sol";
import "./libraries/utils/Address.sol";
import "./libraries/utils/ReentrancyGuard.sol";

import "./interfaces/IRouter.sol";
import "./interfaces/IOrderBook.sol";
import "./interfaces/IPriceFeed.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IUniswapSwap.sol";

contract OrderBookExec is ReentrancyGuard, IOrderBook {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    uint256 public constant PRICE_PRECISION = 1e30;

    struct SwapOrder {
        address account;
        address[] path;
        uint256[] tokenDecimals;
        uint256 amountIn;
        uint256 minOut;
        uint256 triggerRatio;
        bool triggerAboveThreshold;
        bool shouldUnwrap;
        uint256 executionFee;
        uint24 fee;
    }

    mapping(address => mapping(uint256 => SwapOrder)) public swapOrders;
    mapping(address => uint256) public swapOrdersIndex;
    mapping(address => bool) public isOrderKeeper;

    address public gov;
    address public weth;
    address public priceFeed;
    address public exchangeRouter;
    address public customRouter;
    address public uniSwapParamsGen;
    uint256 public minExecutionFee;
    uint256 public minPurchaseTokenAmountUsd;
    bool public isInitialized = false;

    event CreateSwapOrder(
        address indexed account,
        uint256 orderIndex,
        address[] path,
        uint256[] tokenDecimals,
        uint256 amountIn,
        uint256 minOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    );
    event CancelSwapOrder(
        address indexed account,
        uint256 orderIndex,
        address[] path,
        uint256[] tokenDecimals,
        uint256 amountIn,
        uint256 minOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    );
    event UpdateSwapOrder(
        address indexed account,
        uint256 ordexIndex,
        address[] path,
        uint256[] tokenDecimals,
        uint256 amountIn,
        uint256 minOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    );
    event ExecuteSwapOrder(
        address indexed account,
        uint256 orderIndex,
        address[] path,
        uint256[] tokenDecimals,
        uint256 amountIn,
        uint256 minOut,
        uint256 amountOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    );

    event Initialize(
        address exchangeRouter,
        address customRouter,
        address weth,
        uint256 minExecutionFee,
        uint256 minPurchaseTokenAmountUsd
    );
    event UpdateMinExecutionFee(uint256 minExecutionFee);
    event UpdateMinPurchaseTokenAmountUsd(uint256 minPurchaseTokenAmountUsd);
    event UpdateGov(address gov);
    event SetOrderKeeper(address indexed account, bool isActive);
    event UpdateConfig(address exchangeRouter, address minExecutionFee, address uniSwapParamsGen);

    modifier onlyGov() {
        require(msg.sender == gov, "OrderBook: forbidden");
        _;
    }

    modifier onlyOrderKeeper() {
        require(isOrderKeeper[msg.sender], "OrderBook: forbidden");
        _;
    }

    constructor() public {
        gov = msg.sender;
    }

    function initialize(
        address _exchangeRouter,
        address _customRouter,
        address _uniSwapParamsGen,
        address _weth,
        address _priceFeed,
        uint256 _minExecutionFee,
        uint256 _minPurchaseTokenAmountUsd
    ) external onlyGov {
        require(!isInitialized, "OrderBook: already initialized");
        isInitialized = true;

        exchangeRouter = _exchangeRouter;
        customRouter = _customRouter;
        uniSwapParamsGen = _uniSwapParamsGen;
        weth = _weth;
        priceFeed = _priceFeed;
        minExecutionFee = _minExecutionFee;
        minPurchaseTokenAmountUsd = _minPurchaseTokenAmountUsd;

        emit Initialize(_exchangeRouter, _customRouter, _weth, _minExecutionFee, _minPurchaseTokenAmountUsd);
    }

    receive() external payable {
        require(msg.sender == weth, "OrderBook: invalid sender");
    }

    function approve(address _token, address _spender, uint256 _amount) external onlyGov {
        IERC20(_token).safeApprove(_spender, _amount);
    }

    function setOrderKeeper(address _account, bool _isActive) external onlyGov {
        isOrderKeeper[_account] = _isActive;
        emit SetOrderKeeper(_account, _isActive);
    }

    function setMinExecutionFee(uint256 _minExecutionFee) external onlyGov {
        minExecutionFee = _minExecutionFee;

        emit UpdateMinExecutionFee(_minExecutionFee);
    }

    function setOrderConfig(address _exchangeRouter, address _customRouter, address _uniSwapParamsGen) external onlyGov {
        exchangeRouter = _exchangeRouter;
        customRouter = _customRouter;
        uniSwapParamsGen = _uniSwapParamsGen;

        emit UpdateConfig(_exchangeRouter, _customRouter, _uniSwapParamsGen);
    }


    function setMinPurchaseTokenAmountUsd(uint256 _minPurchaseTokenAmountUsd) external onlyGov {
        minPurchaseTokenAmountUsd = _minPurchaseTokenAmountUsd;

        emit UpdateMinPurchaseTokenAmountUsd(_minPurchaseTokenAmountUsd);
    }

    function setGov(address _gov) external onlyGov {
        gov = _gov;

        emit UpdateGov(_gov);
    }

    function getSwapOrder(address _account, uint256 _orderIndex) override public view returns (
        address path0,
        address path1,
        address path2,
        uint256 amountIn,
        uint256 minOut,
        uint256 triggerRatio,
        bool triggerAboveThreshold,
        bool shouldUnwrap,
        uint256 executionFee,
        uint24 fee
    ) {
        SwapOrder memory order = swapOrders[_account][_orderIndex];

        return (
        order.path.length > 0 ? order.path[0] : address(0),
        order.path.length > 1 ? order.path[1] : address(0),
        order.path.length > 2 ? order.path[2] : address(0),
        order.amountIn,
        order.minOut,
        order.triggerRatio,
        order.triggerAboveThreshold,
        order.shouldUnwrap,
        order.executionFee,
        order.fee
        );
    }

    function createSwapOrder(
        address[] memory _path,
        uint256[] memory _tokenDecimals,
        uint256 _amountIn,
        uint256 _minOut,
        uint256 _triggerRatio, // tokenB / tokenA
        bool _triggerAboveThreshold,
        uint256 _executionFee,
        bool _shouldWrap,
        bool _shouldUnwrap,
        uint24 _fee
    ) external payable nonReentrant {
        require(_path.length == 2 || _path.length == 3, "OrderBook: invalid _path.length");
        require(_path[0] != _path[_path.length - 1], "OrderBook: invalid _path");
        require(_amountIn > 0, "OrderBook: invalid _amountIn");
        require(_executionFee >= minExecutionFee, "OrderBook: insufficient execution fee");

        // always need this call because of mandatory executionFee user has to transfer in ETH
        _transferInETH();

        if (_shouldWrap) {
            require(_path[0] == weth, "OrderBook: only weth could be wrapped");
            require(msg.value == _executionFee.add(_amountIn), "OrderBook: incorrect value transferred");

            // If we want to support wrapping eth from the contract
             IERC20(_path[0]).safeTransfer(msg.sender, _amountIn);

        } else {
            require(msg.value == _executionFee, "OrderBook: incorrect execution fee transferred");
        }

        _createSwapOrder(msg.sender, _path, _tokenDecimals, _amountIn, _minOut,
            _triggerRatio, _triggerAboveThreshold, _shouldUnwrap, _executionFee, _fee);
    }

    function _createSwapOrder(
        address _account,
        address[] memory _path,
        uint256[] memory _tokenDecimals,
        uint256 _amountIn,
        uint256 _minOut,
        uint256 _triggerRatio,
        bool _triggerAboveThreshold,
        bool _shouldUnwrap,
        uint256 _executionFee,
        uint24 _fee
    ) private {
        uint256 _orderIndex = swapOrdersIndex[_account];
        SwapOrder memory order = SwapOrder(
            _account,
            _path,
            _tokenDecimals,
            _amountIn,
            _minOut,
            _triggerRatio,
            _triggerAboveThreshold,
            _shouldUnwrap,
            _executionFee,
            _fee
        );
        swapOrdersIndex[_account] = _orderIndex.add(1);
        swapOrders[_account][_orderIndex] = order;

        emit CreateSwapOrder(
            _account,
            _orderIndex,
            _path,
            _tokenDecimals,
            _amountIn,
            _minOut,
            _triggerRatio,
            _triggerAboveThreshold,
            _shouldUnwrap,
            _executionFee,
            _fee
        );
    }

    function cancelSwapOrder(uint256 _orderIndex) public nonReentrant {
        SwapOrder memory order = swapOrders[msg.sender][_orderIndex];
        require(order.account != address(0), "OrderBook: non-existent order");

        delete swapOrders[msg.sender][_orderIndex];

        if (order.path[0] == weth) {
            _transferOutETH(order.executionFee.add(order.amountIn), msg.sender);
        } else {
            IERC20(order.path[0]).safeTransfer(msg.sender, order.amountIn);
            _transferOutETH(order.executionFee, msg.sender);
        }

        emit CancelSwapOrder(
            msg.sender,
            _orderIndex,
            order.path,
            order.tokenDecimals,
            order.amountIn,
            order.minOut,
            order.triggerRatio,
            order.triggerAboveThreshold,
            order.shouldUnwrap,
            order.executionFee,
            order.fee
        );
    }

    function validateSwapOrderPriceWithTriggerAboveThreshold(
        address[] memory _path,
        uint256[] memory _tokenDecimals,
        bool _triggerAboveThreshold,
        uint256 _triggerRatio,
        uint24 _fee
    ) public view returns (bool) {
        require(_path.length == 2 || _path.length == 3, "OrderBook: invalid _path.length");

        address tokenA = _path[0];
        address tokenB = _path[_path.length - 1];

        (uint256 tokenAPrice, uint256 tokenBPrice) = IPriceFeed(priceFeed).getAmmPrice(tokenA, tokenB, _fee, _tokenDecimals);

        // Use price of 1 Input token = x Output token as the ratio e.g 1 ETH = 0.05 BTC
        // so current ratio will be 0.05
        uint256 currentRatio = tokenAPrice;
        bool isValid = _triggerAboveThreshold ? currentRatio > _triggerRatio : currentRatio < _triggerRatio;
        return isValid;
    }

    function updateSwapOrder(uint256 _orderIndex, uint256 _minOut, uint256 _triggerRatio, bool _triggerAboveThreshold) external nonReentrant {
        SwapOrder storage order = swapOrders[msg.sender][_orderIndex];
        require(order.account != address(0), "OrderBook: non-existent order");

        order.minOut = _minOut;
        order.triggerRatio = _triggerRatio;
        order.triggerAboveThreshold = _triggerAboveThreshold;

        emit UpdateSwapOrder(
            msg.sender,
            _orderIndex,
            order.path,
            order.tokenDecimals,
            order.amountIn,
            _minOut,
            _triggerRatio,
            _triggerAboveThreshold,
            order.shouldUnwrap,
            order.executionFee,
            order.fee
        );
    }


    function _transferInETH() private {
        if (msg.value != 0) {
            IWETH(weth).deposit{value : msg.value}();
        }
    }

    function _transferOutETH(uint256 _amountOut, address payable _receiver) private {
        IWETH(weth).withdraw(_amountOut);
        _receiver.sendValue(_amountOut);
    }

    function transferOut(address _token, uint _amountOutEth) external onlyGov {
        address payable _receiver = msg.sender;
        uint256 _amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, _amount);
        _receiver.sendValue(_amountOutEth);
    }

    function executeSingleSwapOrder(
        uint160 _sqrtPriceLimitX96,
        address _account,
        uint256 _orderIndex,
        address payable _feeReceiver) override external nonReentrant onlyOrderKeeper {

        SwapOrder memory order = swapOrders[_account][_orderIndex];
        require(order.account != address(0), "OrderBook: non-existent order");

        require(
            validateSwapOrderPriceWithTriggerAboveThreshold(order.path, order.tokenDecimals, order.triggerAboveThreshold,
            order.triggerRatio, order.fee),
            "OrderBook: invalid price for execution"
        );

        delete swapOrders[_account][_orderIndex];

        uint256 _amountOut;
        address tokenIn = order.path[0];
        address tokenOut = order.path[order.path.length - 1];

        IRouter(customRouter).pluginTransfer(tokenIn, order.account, address(this), order.amountIn);
        if (tokenOut == weth && order.shouldUnwrap) {
            ISwapRouter.ExactInputSingleParams memory params = IUniswapSwap(uniSwapParamsGen).swapExactInputSingleHop(tokenIn, tokenOut,
                order.fee, order.amountIn, order.minOut, _sqrtPriceLimitX96, address(this));
            _amountOut = ISwapRouter(exchangeRouter).exactInputSingle(params);

            _transferOutETH(_amountOut, payable(order.account));

        } else {
            ISwapRouter.ExactInputSingleParams memory params = IUniswapSwap(uniSwapParamsGen).swapExactInputSingleHop(tokenIn, tokenOut,
                order.fee, order.amountIn, order.minOut, _sqrtPriceLimitX96, order.account);
            _amountOut = ISwapRouter(exchangeRouter).exactInputSingle(params);
        }

        // pay executor
        _transferOutETH(order.executionFee, _feeReceiver);

        emit ExecuteSwapOrder(
            _account,
            _orderIndex,
            order.path,
            order.tokenDecimals,
            order.amountIn,
            order.minOut,
            _amountOut,
            order.triggerRatio,
            order.triggerAboveThreshold,
            order.shouldUnwrap,
            order.executionFee,
            order.fee
        );
    }

    function executeMultipleSwapOrder(bytes calldata path,
        address _account,
        uint256 _orderIndex,
        address payable _feeReceiver) override external nonReentrant onlyOrderKeeper {

        SwapOrder memory order = swapOrders[_account][_orderIndex];
        require(order.account != address(0), "OrderBook: non-existent order");

        require(
            validateSwapOrderPriceWithTriggerAboveThreshold(order.path, order.tokenDecimals, order.triggerAboveThreshold,
            order.triggerRatio, order.fee),
            "OrderBook: invalid price for execution"
        );

        delete swapOrders[_account][_orderIndex];

        uint256 _amountOut;
        address tokenIn = order.path[0];
        address tokenOut = order.path[order.path.length - 1];

        IRouter(customRouter).pluginTransfer(tokenIn, order.account, address(this), order.amountIn);
        if (tokenOut == weth && order.shouldUnwrap) {
            ISwapRouter.ExactInputParams memory params = IUniswapSwap(uniSwapParamsGen).swapExactInputMultiHop(path, order.amountIn,
                order.minOut, address(this));
            _amountOut = ISwapRouter(exchangeRouter).exactInput(params);

            _transferOutETH(_amountOut, payable(order.account));

        } else {
            ISwapRouter.ExactInputParams memory params = IUniswapSwap(uniSwapParamsGen).swapExactInputMultiHop(path, order.amountIn,
                order.minOut, order.account);
            _amountOut = ISwapRouter(exchangeRouter).exactInput(params);
        }

        // pay executor
        _transferOutETH(order.executionFee, _feeReceiver);

        emit ExecuteSwapOrder(
            _account,
            _orderIndex,
            order.path,
            order.tokenDecimals,
            order.amountIn,
            order.minOut,
            _amountOut,
            order.triggerRatio,
            order.triggerAboveThreshold,
            order.shouldUnwrap,
            order.executionFee,
            order.fee
        );
    }

}

