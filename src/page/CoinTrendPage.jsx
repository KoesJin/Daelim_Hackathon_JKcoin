import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { CSSTransition } from 'react-transition-group';
import { ReactComponent as SettingsIcon } from '../svg/ExChangePage/Header/settings.svg';
import SettingsModal from '../component/SettingsIcon/SettingsModal';
import LoadingComponent from '../component/LoadingPage/LoadingComponent';
import styles from '../css/CoinTrendPage/CoinTrendPage.module.css';
import { useNavigate, useOutletContext } from 'react-router-dom';

const CoinTrend = () => {
    const [currentPrices, setCurrentPrices] = useState({});
    const [exchangeRates, setExchangeRates] = useState({});
    const [loading, setLoading] = useState(true);
    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const navigate = useNavigate();
    if (!localStorage.getItem('user_key')) {
        navigate('/LoginPage');
    }
    if (localStorage.getItem('user_key') === 'null') {
        navigate('/LoginPage');
    }

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
            return usdAmount * (exchangeRate || 0); // Fallback if no exchange rate is available
        },
        [exchangeRates]
    );

    const fetchCurrentPrices = useCallback(async () => {
        try {
            const coinSymbols = coinNames.join(',');
            const response = await axios.get(`https://api.coincap.io/v2/assets?ids=${coinSymbols}`);

            const prices = {};
            response.data.data.forEach((coin) => {
                prices[coin.id] = parseFloat(coin.priceUsd);
            });

            setCurrentPrices(prices);

            const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
            if (exchangeRateResponse.data && exchangeRateResponse.data.rates) {
                setExchangeRates(exchangeRateResponse.data.rates);
            } else {
                console.error('Failed to fetch exchange rates');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(true); // 로딩 상태를 계속 유지
        }
    }, [coinNames]);

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

                await axios.post(`${baseURL}/api/total_coin_value`, {
                    user_key: userKey,
                });

                await fetchCurrentPrices();
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(true); // 로딩 상태를 계속 유지
            }
        };

        fetchData();
    }, [fetchCurrentPrices, coinNames]);

    const formatNumber = (number, decimals = 2) => {
        return number.toLocaleString('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const generateChartData = (coin) => {
        const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
        const data = labels.map(() => Math.random() * 10000); // Generate random data for demo

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

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <CSSTransition
                in={!loading}
                timeout={300}
                classNames={{
                    enter: styles.fadeEnter,
                    enterActive: styles.fadeEnterActive,
                    exit: styles.fadeExit,
                    exitActive: styles.fadeExitActive,
                }}
                unmountOnExit
            >
                <div className={styles.header}>
                    <div className={styles.title}>코인동향</div>
                    <SettingsIcon className={styles.icon} onClick={openModal} />
                </div>
            </CSSTransition>
            <CSSTransition
                in={!loading}
                timeout={300}
                classNames={{
                    enter: styles.fadeEnter,
                    enterActive: styles.fadeEnterActive,
                    exit: styles.fadeExit,
                    exitActive: styles.fadeExitActive,
                }}
                unmountOnExit
            >
                <div className={styles.container}>
                    <div className={styles.chartWrapper}>
                        <div className={styles.chartContainer}>
                            {coinNames.map((coinName) => {
                                const currentPrice = currentPrices[coinName];
                                const convertedPrice = convertUSDToKRW(currentPrice || 0);

                                return (
                                    <div key={coinName} className={styles.coinItem}>
                                        <div className={styles.coinHeader}>
                                            <div className={styles.coinName}>{coinName}</div>
                                            <div className={styles.coinPrice}>
                                                현재가: {formatNumber(convertedPrice)} KRW
                                            </div>
                                        </div>
                                        <Line data={generateChartData({ coinName })} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CSSTransition>
            {loading && <LoadingComponent />}
            {isModalOpen && <SettingsModal onClose={closeModal} />}
        </>
    );
};

export default CoinTrend;
