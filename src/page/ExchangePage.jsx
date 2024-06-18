import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExchangePage = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeRate, setExchangeRate] = useState(null);

    useEffect(() => {
        // Function to fetch exchange rate from ExchangeRate-API
        const fetchExchangeRate = async () => {
            try {
                const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                setExchangeRate(response.data.rates.KRW);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            }
        };

        // Function to fetch cryptocurrency data from CoinCap API
        const fetchCryptoData = async () => {
            try {
                // List of cryptocurrencies you want to fetch data for
                const cryptocurrencies = [
                    'bitcoin',
                    'solana',
                    'ethereum',
                    'stacks',
                    'aelf',
                    'dogecoin',
                    'status',
                    'tether',
                    'litecoin',
                    'cardano',
                    'chainlink',
                    'vechain',
                    'stellar',
                    'cosmos',
                    'tron'
                ];

                // Fetching data for each cryptocurrency
                const promises = cryptocurrencies.map(crypto =>
                    axios.get(`https://api.coincap.io/v2/assets/${crypto}`)
                );

                // Waiting for all requests to complete
                const responses = await Promise.all(promises);

                // Fetching exchange rate
                const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const exchangeRate = exchangeResponse.data.rates.KRW;

                // Extracting required data and converting prices to KRW
                const data = responses.map(response => {
                    const crypto = response.data.data;
                    const priceUsd = parseFloat(crypto.priceUsd);
                    const priceKrw = exchangeRate ? (priceUsd * exchangeRate).toFixed(0) : 'N/A'; // Keep priceKrw as KRW
                    const tradingVolume = parseFloat(crypto.volumeUsd24Hr); // Fetching trading volume in USD

                    return {
                        name: crypto.name,
                        symbol: crypto.symbol,
                        priceUsd: priceUsd.toFixed(4),
                        priceKrw: priceKrw,
                        changePercentage: parseFloat(crypto.changePercent24Hr).toFixed(2),
                        tradingVolume: tradingVolume,
                    };
                });

                // Calculate total market cap (sum of all market caps)
                const totalMarketCap = data.reduce((acc, curr) => acc + curr.marketCap, 0);

                // Adjust market cap to show subtracted values
                data.forEach(item => {
                    item.marketCapAdjusted = totalMarketCap - item.marketCap;
                });

                setCryptoData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching cryptocurrency data:', error);
                setIsLoading(false);
            }
        };

        // Fetch exchange rate and cryptocurrency data on component mount
        fetchExchangeRate();
        fetchCryptoData();
    }, [exchangeRate]); // Run effect whenever exchangeRate changes

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>거래소</h1>
            <div style={styles.content}>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>코인 이름</th>
                                <th>코인 코드</th>
                                <th>가격 (USD)</th>
                                <th>가격 (KRW)</th>
                                <th>전일대비 (24H %)</th>
                                <th>거래 대금 (만 원)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cryptoData.map(crypto => (
                                <tr key={crypto.symbol}>
                                    <td>{crypto.name}</td>
                                    <td>{crypto.symbol}</td>
                                    <td>${crypto.priceUsd}</td>
                                    <td>{crypto.priceKrw !== 'N/A' ? `${crypto.priceKrw} KRW` : 'N/A'}</td>
                                    <td>{crypto.changePercentage}%</td>
                                    <td>{crypto.tradingVolume !== 'N/A' ? `${(crypto.tradingVolume / 1000000).toFixed(3)} 백만` : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        maxWidth: '1000px',
        margin: 'auto',
        marginTop: '20px',
    },
    heading: {
        fontSize: '24px',
        textAlign: 'center',
    },
    content: {
        marginTop: '20px',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px',
    },
    th: {
        backgroundColor: '#f2f2f2',
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '8px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
};

export default ExchangePage;
