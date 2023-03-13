import logo from './logo.png';
import './App.css';
import Web3 from "web3";
import {useState} from "react";
// import File from "./asset/manager.json"
// import Interface from "./asset/contract.json"
// import ContractBalance from "./components/ContractBalance";
import NetworkSelector from "./components/NetworkSelector";

import MyButton from "./components/MyButton";

function App() {

    const initialProvider = new Web3.providers.HttpProvider('https://meer.testnet.meerfans.club/');
    const initialHref = "'https://testnet.qng.meerscan.io/tx/'";
    const [web3Provider, setWeb3Provider] = useState(initialProvider);
    const [preHref, setPreScanHref] = useState(initialHref);

    function handleProviderChange(provider: any, preScanHref: string) {
        setWeb3Provider(provider);
        setPreScanHref(preScanHref);
    }

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <img src={logo} className="App-logo" alt="logo" />
                    {/*<p className={"tittle"}>Qitmeer Testnet Faucet</p>*/}
                    <div className={"tittle"}>Qitmeer Testnet Faucet<span><NetworkSelector onProviderChange={handleProviderChange} /></span></div>
                </div>
                <div>
                    <MyButton web3Provider={web3Provider}  preHref={preHref} />
                </div>

            </header>
            <footer className="content">
                <div className="left">@ 2022 meerfans.club</div>
                <div className="middle"> </div>
                <div className="right">
                    <a className={"link"} href={"https://www.qitmeer.io/"}>Qitmeer.io</a><a className={"link"} href={"https://github.com/Qitmeer/qng"}>QNG-Node</a><a className={"link"} href={"https://www.qitmeer.io/#/telegram"}>Community</a>
                </div>
            </footer>
            {/*<section className={"history"}>*/}
            {/*    /!*<div>ssss</div>*!/*/}
            {/*</section>*/}
        </div>
    );
}

export default App;


// function FaucetBalance() {
//     const [faucetBalance, setFaucetBalance] = useState();
//     const [checked, setChecked] = useState(false);
//
//     async function handleClick() {
//         // const Web3 = require("web3");
//         // wss://ws.qitmeer.io （主网接口）
//         // const web3 = new Web3('wss://evm-testnet-node.qitmeer.io');
//         // const web3 = new Web3('https://meer.testnet.meerfans.club/');
//         const web3 = new Web3('https://qit.testnet.meerfans.club/');
//         const contractAddress = Interface.address;
//         // const contractAddress = "0x8c065027220a18DB163e685F1ffBf3F6F0437944";
//         // const faucetBalance = web3.utils.fromWei(await web3.eth.getBalance(contractAddress));
//         // alert("Faucet balance: "+ faucetBalance + " MEER")
//         setFaucetBalance(web3.utils.fromWei(await web3.eth.getBalance(contractAddress)));
//         setChecked(!checked);
//     }
//
//     return (
//         <div>
//             {!checked?
//                 <button onClick={handleClick} className={"checkButton"}>Check Faucet Balance</button>
//                 :
//                 <p className={"checkBalance"}>Faucet Balance: {faucetBalance} MEER</p>
//             }
//         </div>
//     )
// }

