import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ContractBalance = ({ contractAddress, web3Provider }) => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        // const web3 = new Web3(Web3.givenProvider);
        const web3 = new Web3(web3Provider);
        const interval = setInterval(() => {
            web3.eth.getBalance(contractAddress).then((balance) => {
                setBalance(web3.utils.fromWei(balance, 'ether'));
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [contractAddress, web3Provider]);

    return (
        <div className={"checkBalance"}>
            Contract balance: {balance} Meer
        </div>
    );
};

export default ContractBalance;
