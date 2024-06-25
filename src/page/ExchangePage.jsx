import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { CSSTransition } from 'react-transition-group';
import ExChangePageHeader from '../component/ExChangePage/Header/ExChangePageHeader';
import ExChangePageMid from '../component/ExChangePage/Mid/ExChangePageMid';
import LoadingComponent from '../component/LoadingPage/LoadingComponent';
import styles from '../css/Loading/Loading.module.css';
import { useOutletContext } from 'react-router-dom';

const ExchangePage = () => {
    const [exchangeRate, setExchangeRate] = useState(null);
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [priceChanges, setPriceChanges] = useState({});
    const { setIsModalOpen } = useOutletContext();
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const user_key = localStorage.getItem('user_key');
                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/favorites_select_user`, {
                    user_key: user_key, // 적절한 user_key를 넣어주세요
                });
                if (response.data.valid) {
                    setFavorites(response.data.coin_names); // coin_name이 ','로 구분된 문자열이라고 가정합니다.
                } else {
                    setFavorites([]);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, []);

    const cryptoSymbols2 = useMemo(() => [...favorites], [favorites]);

    const cryptoSymbols1 = useMemo(
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
    const favoritesFa = localStorage.getItem('favorites_fa');
    const cryptoSymbols = favoritesFa === '1' ? cryptoSymbols1 : cryptoSymbols2;
    useEffect(() => {
        let timeoutId;

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
                const updatedPriceChanges = { ...priceChanges };

                filteredData.forEach((crypto) => {
                    const priceUsd = parseFloat(crypto.priceUsd);
                    const prevPrice = priceChanges[crypto.id] ? priceChanges[crypto.id].price : priceUsd;
                    const changeType =
                        priceUsd > prevPrice
                            ? 'up'
                            : priceUsd < prevPrice
                            ? 'down'
                            : priceChanges[crypto.id]?.type || '';

                    updatedPriceChanges[crypto.id] = {
                        price: priceUsd,
                        type: changeType,
                    };
                });

                const sortedData = cryptoSymbols.map((symbol) => filteredData.find((crypto) => crypto?.id === symbol));

                setPriceChanges(updatedPriceChanges);
                setCryptoData(sortedData);
                setLoading(false);
            } catch (err) {
                console.error('Error while fetching crypto data:', err.message);
                setError('Error fetching data');
                setLoading(false);
            }
        };

        const fetchData = async () => {
            await fetchExchangeRate();
            await fetchCryptoData();
        };

        fetchData();

        const intervalId = setInterval(() => {
            fetchData();
        }, 3000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [cryptoSymbols, priceChanges, loading]);

    return (
        <>
            <CSSTransition
                in={!loading && !error}
                timeout={300}
                classNames={{
                    enter: styles.fadeEnter,
                    enterActive: styles.fadeEnterActive,
                    exit: styles.fadeExit,
                    exitActive: styles.fadeExitActive,
                }}
                unmountOnExit
            >
                <ExChangePageHeader onModalChange={setIsModalOpen} />
            </CSSTransition>
            <CSSTransition
                in={!loading && !error}
                timeout={300}
                classNames={{
                    enter: styles.fadeEnter,
                    enterActive: styles.fadeEnterActive,
                    exit: styles.fadeExit,
                    exitActive: styles.fadeExitActive,
                }}
                unmountOnExit
            >
                <ExChangePageMid exchangeRate={exchangeRate} cryptoData={cryptoData} priceChanges={priceChanges} />
            </CSSTransition>
            {loading && <LoadingComponent />}
            {error && <div className={styles.error}>{error}</div>}
        </>
    );
};

export default ExchangePage;
