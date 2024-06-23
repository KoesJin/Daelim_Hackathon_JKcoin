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

    // convertUSDToKRW 함수를 useCallback으로 정의
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

    // calculateTotals 함수를 useCallback으로 정의
    const calculateTotals = useCallback(() => {
        let totalPurchased = 0;
        let total_cash = 0;

        coinData.forEach((coin) => {
            if (coin.totalPurchased2 - coin.totalSold2 !== 0) {
                total_cash +=
                    ((((coin.totalPurchased2 - coin.totalSold2) * convertUSDToKRW(currentPrices[coin.coinName]) || 0) -
                        (coin.totalPurchased - coin.totalSold)) /
                        (coin.totalPurchased - coin.totalSold)) *
                    100;
                totalPurchased +=
                    (coin.totalPurchased2 - coin.totalSold2) * convertUSDToKRW(currentPrices[coin.coinName]) || 0;
            }
        });

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

                // Fetch user's total holdings
                const holdingsResponse = await axios.post(`${baseURL}/api/key_money`, {
                    user_key: userKey,
                });

                if (holdingsResponse.data.valid) {
                    setHoldings(holdingsResponse.data.krw);
                } else {
                    console.error('Invalid user_key for holdings');
                    return;
                }

                // Fetch user's total coin values and set coin data for rendering
                const totalValueResponse = await axios.post(`${baseURL}/api/total_coin_value`, {
                    user_key: userKey,
                });

                if (totalValueResponse.data.valid) {
                    setCoinData(totalValueResponse.data.totalCoinData);

                    // Fetch current prices for each coin
                    await fetchCurrentPrices(totalValueResponse.data.totalCoinData);

                    // Set isDataReady to true after fetching current prices and exchange rates
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

            // Fetch exchange rates
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
    }, [isDataReady, currentPrices, exchangeRates, calculateTotals]); // Recalculate totals when data is ready or currentPrices/exchangeRates change

    const formatNumber = (number, decimals = 0) => {
        if (number === undefined || number === null) {
            return ''; // Or handle as per your application's logic
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
                <h2>보유 자산(KRW): {formatNumber(holdings, 0)} KRW</h2>
                <h2>코인의 총 가치(KRW): {formatNumber(totalPurchased, 0)} KRW</h2>
                <h2 className={styles.profit}>총 손익: {formatNumber(totalProfit, 4)}%</h2>
            </div>
            <div className={styles.coinsList}>
                <h2>보유 코인</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.coinTable}>
                        <thead>
                            <tr>
                                <th>코인</th>
                                <th>수량</th>
                                <th>현재 가격 (KRW)</th>
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
                                            : formatNumber(
                                                  ((totalValue - (coin.totalPurchased - coin.totalSold)) /
                                                      (coin.totalPurchased - coin.totalSold)) *
                                                      100,
                                                  3
                                              ) + '%';

                                    return (
                                        <tr key={coin.coinName}>
                                            <td>
                                                <Link to={`/buycoins?coinName=${encodeURIComponent(coin.coinName)}`}>
                                                    {coin.coinName}
                                                </Link>
                                            </td>
                                            <td>{formatNumber(totalAmount, 4)}</td>
                                            <td>{formatNumber(convertedPrice, 4)}</td>
                                            <td>{formatNumber(totalValue, 4)}</td>
                                            <td>{percentageChange}</td>
                                        </tr>
                                    );
                                }
                                return null; // 반환값이 없을 경우 null 반환
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyCoinPage;
