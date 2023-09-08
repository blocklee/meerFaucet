import {useState} from "react";
import Web3 from "web3";
import Interface from "../../asset/contract.json";
import File from "../../asset/manager.json";
import ContractBalance from "../ContractBalance";


export default function MyButton(props) {
    const { web3Provider, preHref } = props;

    const [clicked, setClicked] = useState(false);
    const [hash, setHash] = useState();
    const [href, setHref] = useState();
    const [showHash, setShowHash] = useState(false);

    async function sendMeer() {
        const web3 = new Web3(web3Provider)

        const contractAddress = Interface.address;
        const abi = Interface.abi;
        const contract = new web3.eth.Contract(abi,contractAddress);
        const toAddress = document.getElementById("getAddr").value;
        const currentTimestamp = Date.now();
        console.log(currentTimestamp)

        let addrList = [];

        const checkAddress = async (userAddress) => {
            // console.log(userAddress+":")
            // 先判定是否为以太坊地址，然后 冷却时间需要大于 coolDownPeriod 设置的24小时；同时已领取次数要小于20次
            if (!web3.utils.isAddress(userAddress)) {
                alert("Please input a valid MEER EVM address!")
            }
            else {
                const requestTimes = await contract.methods.requestedTimes(userAddress).call();
                console.log("requestTimes:"+requestTimes)
                const lastCalled = await contract.methods.lastCalled(userAddress).call();
                console.log("lastCalled:"+lastCalled)
                const coolDownPeriod = await contract.methods.coolDownPeriod().call();
                console.log("coolDownPeriod:"+coolDownPeriod)

                if ((lastCalled + coolDownPeriod) <= currentTimestamp) {
                    if (requestTimes < 100) {
                        // 检查通过了才加入领取队列 toAddress[]
                        addrList.push(userAddress);
                        // console.log(addrList);
                    } else {
                        alert("This address has requested 100 times!")
                    }
                } else {
                    alert("CoolDown period has not ended!")
                }
            }
        }

        await checkAddress(toAddress);

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

        if (addrList.length !== 0) {
            setClicked(!clicked);
            const gasPrice = await web3.eth.getGasPrice();
            // console.log(gasPrice);

            // 组装交易
            const tx = {
                from: manager.address,
                to: contractAddress,
                value: '0x0',
                gasLimit: 200000,
                gasPrice: gasPrice,
                data: contract.methods.requestToken(addrList).encodeABI()
            }
            const signedTx = await manager.signTransaction(tx);
            // 发送交易触发合约
            const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(result);

            const transactionHash = result.transactionHash;

            setClicked(false);
            setHash(transactionHash);

            const href = preHref + transactionHash;
            console.log(href)
            setHref(href);
            setShowHash(true);

            // console.log('to:',toAddress, 'transactionHash:',transactionHash)
            alert("0.2 MEER(testnet) has been sent to \n\n" + toAddress + "\n\n at transaction \n\n" + transactionHash)

        } else {
            console.log("Your address not meet the criteria!")
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
