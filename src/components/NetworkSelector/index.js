import React, {useState} from 'react';
import Web3 from 'web3';

interface NetworkSelectorProps {
    // onProviderChange: (provider: any) => void;
    onProviderChange: (provider: any, preScanHref: string) => void;
    // preScanHref: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ onProviderChange }) => {
    const [selectedNetwork, setSelectedNetwork] = useState('testnet');

    function handleNetworkChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const network = event.target.value;
        setSelectedNetwork(network);

        // 根据用户的选择，更新 provider
        let providerUrl;
        let preScanHref;
        if (network === 'testnet') {
            providerUrl = 'https://meer.testnet.meerfans.club/';
            preScanHref = "https://testnet.qng.meerscan.io/tx/";
        } else if (network === 'qitsubnet') {
            providerUrl = 'https://qit.testnet.meerfans.club/';
            preScanHref = "https://testnet.evm.meerscan.com/tx/";
        }
        const provider = new Web3.providers.HttpProvider(providerUrl);
        onProviderChange(provider, preScanHref);
    }


    return (
        <div>
            <select value={selectedNetwork} onChange={handleNetworkChange}>
                <option value="testnet">MeerEVM</option>
                <option value="qitsubnet">QitSubnet</option>
            </select>
        </div>
    );
};

export default NetworkSelector;
