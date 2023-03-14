// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "./Owner.sol";

// 改进水龙头
contract Faucet is Owner{

    address private manager;
    uint256 public amountAllowed = 1 ether;
    //    mapping(address => bool) public requestedAddress;
    mapping(address => uint256) public requestedTimes;
    // 设置冷却时间以及记录上次调用时间
    mapping(address => uint) public lastCalled;
    uint public coolDownPeriod = 24 hours;

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
        require(msg.sender == manager, "Caller is not manager!");
        require(address(this).balance >= amountAllowed, "Faucet empty!");
        require(requestedTimes[account] < 20, "Can't request more than 20 times!");
        // 24小时冷却时间判定
        require(lastCalled[account] + coolDownPeriod <= block.timestamp, "Cooldown period has not ended");
        // 更新冷却状态
        lastCalled[msg.sender] = block.timestamp;

        // 发送 token
        payable(account).transfer(amountAllowed);
        requestedTimes[account] += 1;

        emit SendToken(account, amountAllowed);
    }

    receive() external payable {}
}

