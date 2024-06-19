import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';
<<<<<<< HEAD
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg'; // SVG 파일을 import합니다.
=======
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg';
import { Link } from 'react-router-dom';
>>>>>>> 7ccc757 (commit:0.3S (중간 푸시))

const ExChangePageMid = () => {
    const [exchangeRate, setExchangeRate] = useState(null);
<<<<<<< HEAD
    const [activeTab, setActiveTab] = useState('KRW');
    const [updatedPrices, setUpdatedPrices] = useState({});
=======
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
>>>>>>> 7ccc757 (commit:0.3S (중간 푸시))

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
<<<<<<< HEAD
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
=======
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
>>>>>>> 7ccc757 (commit:0.3S (중간 푸시))

        fetchData();

        const intervalId = setInterval(() => {
            fetchData();
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>오류: {error}</p>;

    return (
        <div className={styles.content}>
            <div className={styles.searchBar}>
                <SearchIcon className={styles.searchIcon} />
                <input type="text" placeholder="코인명/심볼 검색" />
            </div>
            <div className={styles.tabs}>
<<<<<<< HEAD
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
=======
                <button className={`${styles.tab} ${styles.active}`}>KRW</button>
                <button className={styles.tab}>USDT</button>
                <button className={styles.tab}>관심</button>
            </div>
            <div className={styles.exchangeTableContainer}>
                <table className={styles.exchangeTable}>
                    <thead>
                        <tr>
                            <th>코인 이름/코드</th>
                            <th>가격 (USD)</th>
                            <th>가격 (KRW)</th>
                            <th>전일대비 (24H %)</th>
                            <th>거래 대금 (백만 원)</th>
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
                                <td>${parseFloat(coin.priceUsd).toFixed(3)}</td>
                                <td>{(parseFloat(coin.priceUsd) * exchangeRate).toFixed(3)} KRW</td>
                                <td>{parseFloat(coin.changePercent24Hr).toFixed(2)}%</td>
                                <td>{(parseFloat(coin.volumeUsd24Hr) / 1000000).toFixed(2)}백만</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
>>>>>>> 7ccc757 (commit:0.3S (중간 푸시))
        </div>
    );
};

export default ExChangePageMid;
