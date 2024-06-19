import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg'; // SVG 파일을 import합니다.

const ExChangePageMid = () => {
    const [cryptoData, setCryptoData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [activeTab, setActiveTab] = useState('KRW');
    const [updatedPrices, setUpdatedPrices] = useState({});

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
                    'polkadot',
                    'uniswap',
                    'aave',
                    'algorand',
                    'avalanche',
                    'monero',
                    'tezos',
                    'nem',
                    'dash',
                    'iota',
                    'zcash',
                    'decred',
                    'qtum',
                    'waves',
                    'maker',
                    'compound',
                    'yearn-finance',
                    'balancer',
                    'curve-dao-token',
                    'ren',
                    'loopring',
                    'zilliqa',
                    'holo',
                    'theta',
                    'enjin-coin',
                    'bancor',
                    'ocean-protocol',
                    'serum',
                    'sushiswap',
                    '1inch',
                    'pancakeswap',
                    'bakerytoken',
                ];

                const exchangeResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                const exchangeRate = exchangeResponse.data.rates.KRW;

                const promises = cryptocurrencies.map((crypto) =>
                    axios.get(`https://api.coincap.io/v2/assets/${crypto}`)
                );

                const responses = await Promise.all(promises);

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

                // 업데이트된 가격 추적
                const newUpdatedPrices = {};
                data.forEach((crypto) => {
                    const existingCrypto = cryptoData.find((item) => item.symbol === crypto.symbol);
                    if (existingCrypto && existingCrypto.priceUsd !== crypto.priceUsd) {
                        newUpdatedPrices[crypto.symbol] = true;
                    }
                });
                setUpdatedPrices(newUpdatedPrices);

                setCryptoData(data);
                setIsLoading(false);

                setTimeout(() => setUpdatedPrices({}), 2000); // 애니메이션이 끝난 후 상태 초기화
            } catch (error) {
                console.error('Error fetching cryptocurrency data:', error);
                setIsLoading(false);
            }
        };

        fetchExchangeRate();
        fetchCryptoData();

        const interval = setInterval(fetchCryptoData, 10000); // 10초마다 데이터 갱신
        return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
    }, [cryptoData]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className={styles.content}>
            <div className={styles.searchBar}>
                <SearchIcon className={styles.searchIcon} />
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
                    className={`${styles.tab} ${activeTab === 'BTC' ? styles.active : ''}`}
                    onClick={() => handleTabClick('BTC')}
                >
                    BTC
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
                <div className={styles.exchangeTableContainer}>
                    <table className={styles.exchangeTable}>
                        <thead>
                            <tr>
                                <th>코인 이름/코드</th>
                                <th>가격 (USD)</th>
                                <th>가격 (KRW)</th>
                                <th>전일대비 (24H %)</th>
                                <th>거래 대금 (만 원)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cryptoData.map((crypto) => (
                                <tr key={crypto.symbol}>
                                    <td>
                                        {crypto.name} ({crypto.symbol})
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.price} ${
                                                updatedPrices[crypto.symbol] ? styles.updated : ''
                                            }`}
                                        >
                                            ${crypto.priceUsd}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.price} ${
                                                updatedPrices[crypto.symbol] ? styles.updated : ''
                                            }`}
                                        >
                                            {crypto.priceKrw !== 'N/A' ? `${crypto.priceKrw} KRW` : 'N/A'}
                                        </span>
                                    </td>
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
                </div>
            )}
        </div>
    );
};

export default ExChangePageMid;
