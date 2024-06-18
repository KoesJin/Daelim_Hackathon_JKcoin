import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';

const ExChangePageMid = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [activeTab, setActiveTab] = useState('KRW');

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                setExchangeRate(response.data.rates.KRW);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            }
        };

        const fetchCryptoData = async () => {
            try {
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
                    'tron',
                ];

                const promises = cryptocurrencies.map((crypto) =>
                    axios.get(`https://api.coincap.io/v2/assets/${crypto}`)
                );

                const responses = await Promise.all(promises);

                const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const exchangeRate = exchangeResponse.data.rates.KRW;

                const data = responses.map((response) => {
                    const crypto = response.data.data;
                    const priceUsd = parseFloat(crypto.priceUsd);
                    const priceKrw = exchangeRate ? (priceUsd * exchangeRate).toFixed(0) : 'N/A';
                    const tradingVolume = parseFloat(crypto.volumeUsd24Hr);

                    return {
                        name: crypto.name,
                        symbol: crypto.symbol,
                        priceUsd: priceUsd.toFixed(4),
                        priceKrw: priceKrw,
                        changePercentage: parseFloat(crypto.changePercent24Hr).toFixed(2),
                        tradingVolume: tradingVolume,
                    };
                });

                setCryptoData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching cryptocurrency data:', error);
                setIsLoading(false);
            }
        };

        fetchExchangeRate();
        fetchCryptoData();
    }, [exchangeRate]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={styles.content}>
            <div className={styles.searchBar}>
                <input type="text" placeholder="코인명/심볼 검색" />
            </div>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'KRW' ? styles.active : ''}`}
                    onClick={() => handleTabClick('KRW')}
                >
                    KRW
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'USDT' ? styles.active : ''}`}
                    onClick={() => handleTabClick('USDT')}
                >
                    USDT
                </button>
                <button
                    className={`${styles.tab} ${activeTab === '관심' ? styles.active : ''}`}
                    onClick={() => handleTabClick('관심')}
                >
                    관심
                </button>
            </div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table className={styles.exchangeTable}>
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
                        {cryptoData.map((crypto) => (
                            <tr key={crypto.symbol}>
                                <td>{crypto.name}</td>
                                <td>{crypto.symbol}</td>
                                <td>${crypto.priceUsd}</td>
                                <td>{crypto.priceKrw !== 'N/A' ? `${crypto.priceKrw} KRW` : 'N/A'}</td>
                                <td>{crypto.changePercentage}%</td>
                                <td>
                                    {crypto.tradingVolume !== 'N/A'
                                        ? `${(crypto.tradingVolume / 1000000).toFixed(3)} 백만`
                                        : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ExChangePageMid;
