// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "./Owner.sol";

// 改进水龙头（旧的，新的已增加冷却时间）
contract Faucet is Owner{

    address private manager;
    uint256 public amountAllowed = 0.2 ether;
    mapping(address => uint256) public requestedTimes;

    //  SendToken 事件，记录了每次领取Token的地址和数量
    event SendToken(address indexed receiver, uint256 indexed amount);

    // 设置 水龙头管理者
    event ManagerSet(address indexed oldManager, address indexed newManager);

    constructor() {
        console.log("Faucet manager is:", msg.sender);
        manager = msg.sender; // 'msg.sender' is sender of current call, contract deployer for a constructor
        emit ManagerSet(address(0), manager);
    }

    function changeManager(address newManager) public isOwner {
        emit ManagerSet(manager, newManager);
        manager = newManager;
    }

    function getManager() external view returns (address) {
        return manager;
    }

    function requestToken(address account) external{
        require(msg.sender == manager, "Caller is not manager!"); // 只有 owner 才可以调取合约发币，用owner来支付调取合约的手续费
        require(address(this).balance >= amountAllowed, "Faucet empty!");
        require(requestedTimes[account] < 20, "Can't request more than 20 times!");


        payable(account).transfer(amountAllowed);// 发送 token
        requestedTimes[account] += 1;

        emit SendToken(account, amountAllowed);
    }

    receive() external payable {}
}

