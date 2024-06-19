import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg';
import { Link } from 'react-router-dom';

const ExChangePageMid = () => {
    const [exchangeRate, setExchangeRate] = useState(null);
    const [cryptoSymbols, setCryptoSymbols] = useState([
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
    ]);
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('KRW'); // 현재 활성화된 탭 상태

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                setExchangeRate(response.data.rates.KRW);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchCryptoData = async () => {
            const requests = cryptoSymbols.map((symbol) =>
                axios
                    .get(`https://api.coincap.io/v2/assets/${symbol}`)
                    .then((response) => response.data.data)
                    .catch((error) => {
                        console.error(`Error fetching data for ${symbol}:`, error.message);
                        return null;
                    })
            );

            try {
                const responses = await Promise.all(requests);
                const filteredData = responses.filter((data) => data !== null);
                return filteredData;
            } catch (err) {
                console.error('Error while fetching crypto data:', err.message);
                return [];
            }
        };

        const fetchData = async () => {
            await fetchExchangeRate();
            const data = await fetchCryptoData();
            setCryptoData(data);
            setLoading(false);
        };

        fetchData();

        const intervalId = setInterval(() => {
            fetchData();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [cryptoSymbols]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>오류: {error}</p>;

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
            <div className={styles.exchangeTableContainer}>
                <table className={styles.exchangeTable}>
                    <thead>
                        <tr>
                            <th>코인 이름/코드</th>
                            <th>가격 ({activeTab === 'KRW' ? 'KRW' : 'USD'})</th>
                            <th>전일대비 (24H %)</th>
                            <th>거래 대금 ({activeTab === 'KRW' ? '백만 원' : 'USD'})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cryptoData.map((coin) => (
                            <tr key={coin.id}>
                                <td>
                                    <Link to="/buycoins">
                                        {coin.name} ({coin.symbol})
                                    </Link>
                                </td>
                                <td>
                                    {activeTab === 'KRW'
                                        ? `${(parseFloat(coin.priceUsd) * exchangeRate).toFixed(3)} KRW`
                                        : `$${parseFloat(coin.priceUsd).toFixed(3)}`}
                                </td>
                                <td>{parseFloat(coin.changePercent24Hr).toFixed(2)}%</td>
                                <td>
                                    {activeTab === 'KRW'
                                        ? `${((parseFloat(coin.volumeUsd24Hr) * exchangeRate) / 1000000).toFixed(
                                              2
                                          )}백만`
                                        : `$${parseFloat(coin.volumeUsd24Hr).toFixed(2)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExChangePageMid;
