import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import styles from '../css/CoinTrendPage/CoinTrendPage.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CoinTrend = () => {
    const [coinData, setCoinData] = useState([]);
    const [currentPrices, setCurrentPrices] = useState({});
    const [exchangeRates, setExchangeRates] = useState({});

    const coinNames = useMemo(
        () => [
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
            'bittorrent',
        ],
        []
    );

    const convertUSDToKRW = useCallback(
        (usdAmount) => {
            const exchangeRate = exchangeRates['KRW'];
            if (exchangeRate) {
                return usdAmount * exchangeRate;
            }
            return 0;
        },
        [exchangeRates]
    );

    const fetchCurrentPrices = useCallback(
        async (coins) => {
            try {
                const coinSymbols = coinNames.join(',');
                const response = await axios.get(`https://api.coincap.io/v2/assets?ids=${coinSymbols}`);

                console.log('Current Prices Response:', response.data);

                const prices = {};
                response.data.data.forEach((coin) => {
                    prices[coin.id] = parseFloat(coin.priceUsd); // Assuming price is in USD, adjust as per API response
                });

                setCurrentPrices(prices);

                const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');

                console.log('Exchange Rates Response:', exchangeRateResponse.data);

                if (exchangeRateResponse.data && exchangeRateResponse.data.rates) {
                    setExchangeRates(exchangeRateResponse.data.rates);
                } else {
                    console.error('Failed to fetch exchange rates');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        [coinNames]
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userKey = localStorage.getItem('user_key');
                if (!userKey) {
                    console.error('user_key is missing in localStorage');
                    return;
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    baseURL = 'http://121.139.20.242:5011';
                }

                const totalValueResponse = await axios.post(`${baseURL}/api/total_coin_value`, {
                    user_key: userKey,
                });

                console.log('Total Value Response:', totalValueResponse.data);

                if (totalValueResponse.data.valid) {
                    setCoinData(totalValueResponse.data.totalCoinData);

                    await fetchCurrentPrices(totalValueResponse.data.totalCoinData);
                } else {
                    console.error('Invalid user_key for total coin value');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 3000);

        return () => clearInterval(intervalId);
    }, [fetchCurrentPrices]);

    const formatNumber = (number, decimals = 0) => {
        if (number === undefined || number === null) {
            return '';
        }

        return number.toLocaleString('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const generateChartData = (coin) => {
        // 임시 테스트 데이터를 추가합니다.
        const labels = coin.history
            ? coin.history.map((data) => data.date)
            : ['2024-06-01', '2024-06-02', '2024-06-03'];
        const data = coin.history ? coin.history.map((data) => convertUSDToKRW(data.priceUsd)) : [100, 105, 110];

        return {
            labels,
            datasets: [
                {
                    label: `${coin.coinName} 가격 추이`,
                    data,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    fill: true,
                },
            ],
        };
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>코인동향</div>
            </div>
            <div className={styles.chartContainer}>
                {coinData.map((coin) => {
                    const currentPrice = currentPrices[coin.coinName];
                    const convertedPrice = convertUSDToKRW(currentPrice);

                    return (
                        <div key={coin.coinName} className={styles.coinItem}>
                            <div className={styles.coinHeader}>
                                <div className={styles.coinName}>{coin.coinName}</div>
                                <div className={styles.coinPrice}>현재가: {formatNumber(convertedPrice, 2)} KRW</div>
                            </div>
                            <Line data={generateChartData(coin)} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CoinTrend;
