import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styles from '../css/MyCoinPage/MyCoinPage.module.css';
import { Link } from 'react-router-dom';

const MyCoinPage = () => {
    const [holdings, setHoldings] = useState(0);
    const [totalPurchased, setTotalPurchased] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [coinData, setCoinData] = useState([]);
    const [currentPrices, setCurrentPrices] = useState({});
    const [exchangeRates, setExchangeRates] = useState({});
    const [isDataReady, setIsDataReady] = useState(false);

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

    const calculateTotals = useCallback(() => {
        let totalPurchased = 0;
        let totalPurchased2add = 0;
        let totalPurchasedadd = 0;
        let total_cash = 0;

        coinData.forEach((coin) => {
            if (coin.totalPurchased2 - coin.totalSold2 !== 0) {
                totalPurchased2add +=
                    (coin.totalPurchased2 - coin.totalSold2) * convertUSDToKRW(currentPrices[coin.coinName]) || 0;
                totalPurchasedadd += coin.totalPurchased - coin.totalSold;
                totalPurchased +=
                    (coin.totalPurchased2 - coin.totalSold2) * convertUSDToKRW(currentPrices[coin.coinName]) || 0;
            }
        });
        total_cash = ((totalPurchased2add - totalPurchasedadd) / totalPurchasedadd) * 100;
        setTotalPurchased(totalPurchased);
        setTotalProfit(total_cash);
    }, [coinData, currentPrices, convertUSDToKRW]);

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

                const holdingsResponse = await axios.post(`${baseURL}/api/key_money`, {
                    user_key: userKey,
                });

                if (holdingsResponse.data.valid) {
                    setHoldings(holdingsResponse.data.krw);
                } else {
                    console.error('Invalid user_key for holdings');
                    return;
                }

                const totalValueResponse = await axios.post(`${baseURL}/api/total_coin_value`, {
                    user_key: userKey,
                });

                if (totalValueResponse.data.valid) {
                    setCoinData(totalValueResponse.data.totalCoinData);

                    await fetchCurrentPrices(totalValueResponse.data.totalCoinData);

                    setIsDataReady(true);
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
    }, []);

    const fetchCurrentPrices = async (coins) => {
        try {
            const coinSymbols = coins.map((coin) => coin.coinName).join(',');
            const response = await axios.get(`https://api.coincap.io/v2/assets?ids=${coinSymbols}`);

            const prices = {};
            response.data.data.forEach((coin) => {
                prices[coin.id] = parseFloat(coin.priceUsd); // Assuming price is in USD, adjust as per API response
            });

            setCurrentPrices(prices);

            const exchangeRateResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');

            if (exchangeRateResponse.data && exchangeRateResponse.data.rates) {
                setExchangeRates(exchangeRateResponse.data.rates);
            } else {
                console.error('Failed to fetch exchange rates');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (isDataReady) {
            calculateTotals();
        }
    }, [isDataReady, currentPrices, exchangeRates, calculateTotals]);

    const formatNumber = (number, decimals = 0) => {
        if (number === undefined || number === null) {
            return '';
        }

        return number.toLocaleString('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>코인정보</div>
            </div>
            <div className={styles.searchBar}></div>
            <div className={styles.totalAssets}>
                <span>총 보유자산</span>
                <span>{formatNumber(holdings + totalPurchased, 0)} KRW</span>
            </div>
            <div className={styles.assetDetails}>
                <h2>보유 자산(KRW): {formatNumber(holdings, 4)} </h2>
                <h2>코인의 총 가치(KRW): {formatNumber(totalPurchased, 4)}</h2>
                <h2 className={totalProfit > 0 ? styles.profit : totalProfit < 0 ? styles.loss : styles.neutral}>
                    총 손익: {formatNumber(totalProfit, 4)}%
                </h2>
            </div>
            <div className={styles.coinsList}>
                <div className={styles.Midtitle}>보유 코인</div>
                <div className={styles.tableContainer}>
                    <table className={styles.coinTable}>
                        <thead>
                            <tr>
                                <th>코인</th>
                                <th>수량</th>
                                <th>현재가 (KRW)</th>
                                <th>가치 (KRW)</th>
                                <th>손익 (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coinData.map((coin) => {
                                const currentPrice = currentPrices[coin.coinName];
                                if (coin.totalPurchased2 - coin.totalSold2 !== 0) {
                                    const totalAmount = coin.totalPurchased2 - coin.totalSold2;
                                    const convertedPrice = convertUSDToKRW(currentPrice);
                                    const totalValue = totalAmount * convertedPrice;
                                    const percentageChange =
                                        totalAmount === 0
                                            ? '0%'
                                            : ((totalValue - (coin.totalPurchased - coin.totalSold)) /
                                                  (coin.totalPurchased - coin.totalSold)) *
                                              100;
                                    const profitClass =
                                        percentageChange > 0
                                            ? styles.profit
                                            : percentageChange < 0
                                            ? styles.loss
                                            : styles.neutral;

                                    return (
                                        <tr key={coin.coinName}>
                                            <td>
                                                <Link
                                                    to={`/buycoins?coinName=${encodeURIComponent(coin.coinName)}`}
                                                    className={styles.link}
                                                >
                                                    {coin.coinName}
                                                </Link>
                                            </td>
                                            <td>{formatNumber(totalAmount, 4)}</td>
                                            <td>{formatNumber(convertedPrice, 4)}</td>
                                            <td>{formatNumber(totalValue, 4)}</td>
                                            <td className={profitClass}>{formatNumber(percentageChange, 4)}%</td>
                                        </tr>
                                    );
                                }
                                return null;
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyCoinPage;
