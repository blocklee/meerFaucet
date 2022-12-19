import logo from './logo.png';
import './App.css';
import Web3 from "web3";
import {useState} from "react";
import File from "./asset/manager.json"
import Interface from "./asset/contract.json"

function MyButton() {
    const [clicked, setClicked] = useState(false);
    const [faucetBalance, setFaucetBalance] = useState();
    const [showBalance, setShowBalance] = useState(false)

    async function sendMeer() {
        const web3 = new Web3('wss://ws.meertalk.org');

        // const contractAddress = "0xd59170c9446B9FAF0538BfFa734b73E9326208E5";
        const contractAddress = Interface.address;
        // const abi = [{"inputs":[{"internalType":"address","name":"newManager","type":"address"}],"name":"changeManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"changeOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldManager","type":"address"},{"indexed":true,"internalType":"address","name":"newManager","type":"address"}],"name":"ManagerSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerSet","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"requestToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"Receiver","type":"address"},{"indexed":true,"internalType":"uint256","name":"Amount","type":"uint256"}],"name":"SendToken","type":"event"},{"stateMutability":"payable","type":"receive"},{"inputs":[],"name":"amountAllowed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getManager","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"requestedTimes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
        const abi = Interface.abi;
        const contract = new web3.eth.Contract(abi,contractAddress);
        const toAddress = document.getElementById("getAddr").value;
        if (!web3.utils.isAddress(toAddress)) {
            alert("Please input a valid Ethereum address!")
        }
        else {
            setClicked(!clicked);
            // 水龙头管理员账户，调用合约，支付gas
            // const pKey = fs.readFileSync('./asset/account.txt').toString();
            const pKey = File.key;
            const manager = web3.eth.accounts.privateKeyToAccount(pKey)
            // console.log("manager:",manager.address)

            // 检查 manager 账户余额，如果小于 0.1，要提示增加手续费了
            const managerBalance = await web3.eth.getBalance(manager.address);
            // console.log('managerBalance is',managerBalance)
            if (managerBalance >= 100000000000000000) {
                console.log('managerBalance is:', web3.utils.fromWei(managerBalance), 'meer')
            }
            else {
                console.log("The balance of manager account is less than 0.1 meer, need deposit.")
            }

            // 检查水龙头余额
            const faucetBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
            console.log('faucet balance is:', faucetBalance, 'meer')
            setFaucetBalance(faucetBalance);
            setShowBalance(true);

            // 检查地址是否已经领取超过20次
            const requestStatus = await contract.methods.requestedTimes(toAddress).call();
            console.log('request times:',requestStatus)

            const gasPrice = await web3.eth.getGasPrice()
            // console.log('gasPrice:', gasPrice);

            const tx = {
                from: manager.address,
                to: contractAddress,
                value: '0x0',
                gasLimit: 100000,
                gasPrice: gasPrice,
                data: contract.methods.requestToken(toAddress).encodeABI()
                // data: '0xa037eca9',// 合约方法的 16 进制数据
            }
            const signedTx = await manager.signTransaction(tx)

            // 只有 requestStatus = false 才能领取，true 表示已领取过了，每个地址只能领取一次
            if (requestStatus < 20) {
                console.log(("Transaction pending, please wait a moment!"))
                const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                // console.log(result)
                const transactionHash = result.transactionHash;

                setClicked(false);
                setFaucetBalance(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
                console.log('to:',toAddress, 'transactionHash:',transactionHash)
                alert("0.2 MEER(testnet) has been sent to \n\n" + toAddress + "\n\n at transaction \n\n" + transactionHash)
            }
            else {
                alert("Can't request more than 20 times!")
                setClicked(false);
            }
        }

    }

    return (
        <div>
            <div className={"requestButton"}>
                <input inputMode={"text"} id={"getAddr"} className={"getAddr"} placeholder={"input a evm address"}/>
                {!clicked?
                    <button onClick={sendMeer} className={"button"}>Request MEER</button>
                    :
                    <button className={"button"}>Transaction pending</button>
                }

            </div>
            {/*未点击 request 按钮时显示check balance button*/}
            <div>
                {showBalance? <p className={"checkBalance"}>Faucet Balance: {faucetBalance} MEER</p>:<FaucetBalance />}
            </div>
        </div>
    );
}

function FaucetBalance() {
    const [faucetBalance, setFaucetBalance] = useState();
    const [checked, setChecked] = useState(false);

    async function handleClick() {
        // const Web3 = require("web3");
        // wss://ws.qitmeer.io （主网接口）
        const web3 = new Web3('wss://ws.meertalk.org');
        const contractAddress = "0x8c065027220a18DB163e685F1ffBf3F6F0437944";
        // const faucetBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
        // alert("Faucet balance: "+ faucetBalance + " MEER")
        setFaucetBalance(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
        setChecked(!checked);
    }

    return (
        <div>
            {!checked?
                <button onClick={handleClick} className={"checkButton"}>Check Faucet Balance</button>
                :
                <p className={"checkBalance"}>Faucet Balance: {faucetBalance} MEER</p>
            }
        </div>
    )
}

function App() {

    return (
    <div className="App">
      <header className="App-header">
          <div>
              <img src={logo} className="App-logo" alt="logo" />
              <p className={"tittle"}>Qitmeer Testnet Faucet</p>
          </div>
          <div>
              <MyButton />
              <div><a className={"qngNode"} href={"https://github.com/Qitmeer/qng"}>Get QNG Node</a></div>
              <div><a className={"qngNode"} href={"https://www.qitmeer.io/"}>Qitmeer Network</a></div>
              <div><a className={"qngNode"} href={"https://www.qitmeer.io/#/telegram"}>Qitmeer Community</a></div>
          </div>
      </header>
        {/*<section className={"history"}>*/}
        {/*    /!*<div>ssss</div>*!/*/}
        {/*</section>*/}
    </div>
    );
}

export default App;
