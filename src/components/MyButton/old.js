import {useState} from "react";
import Web3 from "web3";
import Interface from "../../asset/contract.json";
import File from "../../asset/manager.json";
import ContractBalance from "../ContractBalance";


export default function MyButton(props) {
    const { web3Provider, preHref } = props;

    const [clicked, setClicked] = useState(false);
    // const [faucetBalance, setFaucetBalance] = useState();
    // const [showBalance, setShowBalance] = useState(false);
    const [hash, setHash] = useState();
    const [href, setHref] = useState();
    const [showHash, setShowHash] = useState(false);
    const [addrList, setAddrList] = useState();

    async function sendMeer() {
        // const web3 = new Web3('wss://evm-testnet-node.qitmeer.io');
        // const web3 = new Web3('https://meer.testnet.meerfans.club/');
        // const web3 = new Web3('https://qit.testnet.meerfans.club/');
        const web3 = new Web3(web3Provider)

        const contractAddress = Interface.address;
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

            // 检查地址是否已经领取超过20次
            const requestStatus = await contract.methods.requestedTimes(toAddress).call();
            const lastCalled = await contract.methods.lastCalled(toAddress).call();
            console.log('request times:',requestStatus)
            console.log('last called:',lastCalled)

            const gasPrice = await web3.eth.getGasPrice();
            console.log('gasPrice:', gasPrice);

            setAddrList([...addrList, toAddress])

            const tx = {
                from: manager.address,
                to: contractAddress,
                value: '0x0',
                gasLimit: 200000,
                gasPrice: gasPrice,
                // gasPrice: parseInt(gasPrice.toString()) + 1000000000,
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
                setHash(transactionHash);
                // const href = "https://testnet.qng.meerscan.io/tx/" + transactionHash;
                // const href = "https://testnet.evm.meerscan.com/tx/" + transactionHash;
                const href = preHref + transactionHash;
                console.log(href)
                setHref(href);
                setShowHash(true);
                // setFaucetBalance(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
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
                {/*{showBalance? <p className={"checkBalance"}>Faucet Balance: {faucetBalance} MEER</p>:<FaucetBalance />}*/}
                <ContractBalance contractAddress={Interface.address} web3Provider={web3Provider} />
                {showHash &&
                    <p className={"hashLink"}>hash: <a href={href}>{hash}</a></p>
                }
            </div>
        </div>
    );
}
