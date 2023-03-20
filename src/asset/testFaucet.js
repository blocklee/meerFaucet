
// import Interface from "./faucetContract.json";
// import File from "./manager.json";

const Web3 = require("web3");
let web3;
web3 = new Web3("https://qit.testnet.meerfans.club/");

// const contractAddress = Interface.address;
const contractAddress = "0x6edEc795885E93977E2EABdc633fdd42E7C7705E";
// const abi = Interface.abi;
const abi = [{"inputs":[{"internalType":"address","name":"newManager","type":"address"}],"name":"changeManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"destroyContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable[]","name":"accountList","type":"address[]"}],"name":"requestToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldManager","type":"address"},{"indexed":true,"internalType":"address","name":"newManager","type":"address"}],"name":"ManagerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"SendToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"failed","type":"address"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"SendTokenFailed","type":"event"},{"stateMutability":"payable","type":"receive"},{"inputs":[],"name":"amountAllowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"coolDownPeriod","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"lastCalled","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"requestedTimes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"requestLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi,contractAddress);

const currentTimestamp = Date.now();
console.log(currentTimestamp)

// 从前端获取每个用户的领取地址 userAddress 形成领取队列 toAddress[]
// const userAddress = document.getElementById("getAddr").value;
const inputAddress1 = "0xd5849930E89DF5624A2f57084Bc304A3c462e1cC";
const inputAddress2 = "0x391DA25f35f33ae7d29F22B4eF51513D5D016142";

let toAddress = [];
// 对于前端输入的每一个地址需要进行检查,
// async function checkAddress(userAddress) {
const checkAddress = async (userAddress) => {
    console.log(userAddress+":")
    // 先判定是否为以太坊地址，然后 冷却时间需要大于 coolDownPeriod 设置的24小时；同时已领取次数要小于20次
    if (!web3.utils.isAddress(userAddress)) {
        alert("Please input a valid Ethereum address!")
    }
    else {
        const requestTimes = await contract.methods.requestedTimes(userAddress).call();
        console.log(requestTimes)
        const lastCalled = await contract.methods.lastCalled(userAddress).call();
        console.log(lastCalled)
        const coolDownPeriod = await contract.methods.coolDownPeriod().call();
        console.log(coolDownPeriod)
        // const currentTimestamp = Date.now();

        // console.log(currentTimestamp, coolDownPeriod, lastCalled, requestTimes)

        if ((lastCalled + coolDownPeriod) <= currentTimestamp) {
            if (requestTimes < 20) {
                // 检查通过了才加入领取队列 toAddress[]
                toAddress.push(userAddress);
                console.log(toAddress);
            } else {
                console.log("This address has requested 20 times!")
            }
        } else {
            console.log("CoolDown period has not ended")
        }
    }
}

// checkAddress(inputAddress2).then();

async function requestToken() {
    // const pKey = File.key;
    // 下面的 manager 使用了一个公开测试地址，私钥已公开暴露 0x8859Db47433621d39D7cd4B4a5f02ae4E4a8BEEb
    // 正式水龙头将更换之前的 manager 地址
    const pKey = "599076ccd940027b69350d6bdd80aa51306ae09dbc47dcd06e5e7a6e73196c63";
    const manager = web3.eth.accounts.privateKeyToAccount(pKey);
    // 检查 manager 账户余额，如果小于 0.1，要提示增加手续费了
    const managerBalance = await web3.eth.getBalance(manager.address);
    // console.log('managerBalance is',managerBalance)
    if (managerBalance >= 100000000000000000) {
        console.log('managerBalance is:', web3.utils.fromWei(managerBalance), 'meer')
    }
    else {
        console.log("The balance of manager account is less than 0.1 meer, need deposit.")
    }

    // 实际实现中，需要在前端对每个用户的提交执行 check 函数，check 通过的地址将被加入 toAddress[] 队列，后端要设定一个等待前端并发输入的时间，如果在等待时间内没有新的输入，将 toAddress[] 队列作为参数去触发合约；这个等待时间不易过长，最好在10秒内，太长的话用户体验可能不是很好，最新请求的用户可能会等待太久
    // 在执行 toAddress[] 队列去触发合约时，应注意旧的输入地址不会和下一个调用的新输入混一起
    await checkAddress(inputAddress1);
    await checkAddress(inputAddress2);

    // 要执行后面的合约交互交易，必须先保证前边的 check 检查完全通过，注意不要用一个空的 toAddress[] 去触发合约，浪费手续费

    if (toAddress.length !== 0) {
        const gasPrice = await web3.eth.getGasPrice();
        console.log(gasPrice);

        // 组装交易
        const tx = {
            from: manager.address,
            to: contractAddress,
            value: '0x0',
            gasLimit: 200000,
            // gasPrice: 2000000000,
            gasPrice: gasPrice,
            // gasPrice: parseInt(gasPrice.toString()) + 1000000000,
            data: contract.methods.requestToken(toAddress).encodeABI()
            // data: '0xa037eca9',// 合约方法的 16 进制数据
        }
        const signedTx = await manager.signTransaction(tx);
        // 发送交易触发合约
        const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(result);
    } else {
        console.log("No addresses meet the criteria")
    }

}

requestToken().then()