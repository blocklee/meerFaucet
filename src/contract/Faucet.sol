// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "./Owner.sol";

// 改进水龙头
contract Faucet is Owner{

    address private manager;
    uint256 public amountAllowed = 5 ether;
    uint256 public requestLimit = 200;
    mapping(address => uint256) public requestedTimes;
    // 设置冷却时间以及记录上次调用时间
    mapping(address => uint) public lastCalled;
    uint public coolDownPeriod = 72 hours;

    //  SendToken 事件，记录了每次领取Token的地址和数量
    event SendToken(address indexed receiver, uint256 indexed amount);
    event SendTokenFailed(address failed, string reason);

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


    function destroyContract() public isOwner {
        //在自毁合约前必须把合约内的代币（指二层token；selfdestruct()本身就是转走eth）转走
        //        payable(msg.sender).transfer(address(this).balance);
        selfdestruct(payable(msg.sender));
    }


    function requestToken(address payable[] memory accountList) public {
        require(msg.sender == manager, "Caller is not manager!");
        require(address(this).balance >= amountAllowed, "Faucet empty!");
        uint256 length = accountList.length;
        string memory reason = "CoolDown";
        string memory reason_ = "TimesLimit";
        for (uint256 i = 0; i < length; i++) {
            if (lastCalled[accountList[i]] + coolDownPeriod > block.timestamp) {
                emit SendTokenFailed(accountList[i], reason);
                continue; // 跳过冷却未结束的地址
            }
            if (requestedTimes[accountList[i]] >= requestLimit) {
                emit SendTokenFailed(accountList[i], reason_);
                continue; // 跳过请求次数已达到上限的地址
            }
            lastCalled[accountList[i]] = block.timestamp;
            accountList[i].transfer(amountAllowed);
            requestedTimes[accountList[i]] += 1;
            emit SendToken(accountList[i], amountAllowed);

        }
    }

    receive() external payable {}
}


//    function checkRequestCount(address account) public view {
//        // 领取次数上限判定
//        require(requestedTimes[account] < requestLimit, string(abi.encodePacked(account, " this address has requested 20 times!")));
//    }
//
//    function checkCoolDown(address account) public view {
//        // 24小时冷却时间判定
//        require(lastCalled[account] + coolDownPeriod <= block.timestamp, string(abi.encodePacked(account, "CoolDown period has not ended")));
//    }

//    function requestToken(address payable[] memory accountList) public {
//        require(msg.sender == manager, "Caller is not manager!");
//        require(address(this).balance >= amountAllowed, "Faucet empty!");
//        uint256 length = accountList.length;
//        for (uint256 i = 0; i < length; i++) {
//            try this.checkCoolDown(accountList[i]) {
//                try this.checkRequestCount(accountList[i]) {
//                    lastCalled[accountList[i]] = block.timestamp;
//                    accountList[i].transfer(amountAllowed);
//                    requestedTimes[accountList[i]] += 1;
//                    emit SendToken(accountList[i], amountAllowed);
//                } catch (bytes memory /* err */) {
//                    emit SendTokenFailed(accountList[i]);
//                }
//            } catch (bytes memory /* err */) {
//                emit SendTokenFailed(accountList[i]);
//            }
//        }
//    }
