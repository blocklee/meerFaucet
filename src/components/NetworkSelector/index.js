import React, {useState} from 'react';
import Web3 from 'web3';

interface NetworkSelectorProps {
    // onProviderChange: (provider: any) => void;
    onProviderChange: (provider: any, preScanHref: string) => void;
    // preScanHref: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({ onProviderChange }) => {
    const [selectedNetwork, setSelectedNetwork] = useState('qng');

    function handleNetworkChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const network = event.target.value;
        setSelectedNetwork(network);

        // 根据用户的选择，更新 provider
        let providerUrl;
        let preScanHref;
        if (network === 'qng') {
            providerUrl = 'https://meer.testnet.meerfans.club/';
            preScanHref = "https://testnet-qng.qitmeer.io/tx/";
        } else if (network === 'amana') {
            providerUrl = 'https://amana.testnet.meerfans.club/';
            preScanHref = "https://testnet-amana.qitmeer.io/tx/";
        }
        const provider = new Web3.providers.HttpProvider(providerUrl);
        onProviderChange(provider, preScanHref);
    }


    return (
        <div>
            <select value={selectedNetwork} onChange={handleNetworkChange}>
                <option value="qng">QNG Testnet</option>
                <option value="amana">Amana Testnet</option>
            </select>
        </div>
    );
};

export default NetworkSelector;
