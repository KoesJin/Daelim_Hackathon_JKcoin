import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { useLocation, Link } from 'react-router-dom'; // Link를 사용합니다
import axios from 'axios';
import styles from '../css/BuyCoinsPage/BuyCoins.module.css'; // 모듈 CSS 파일 import
import { ReactComponent as BackIcon } from '../svg/BuyCoinsPage/Back.svg';

export default function BuyCoins() {
    const [chartData, setChartData] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [numberOfCoins, setNumberOfCoins] = useState('');
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0); // State to hold wallet balance
    const [showBuyForm, setShowBuyForm] = useState(true); // State to toggle buy form, default is true
    const [showSellForm, setShowSellForm] = useState(false); // State to toggle sell form
    const [ownedCoins, setOwnedCoins] = useState(null); // State to hold owned coins
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const coinName = searchParams.get('coinName')?.toLowerCase();

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                if (data?.data?.length > 0) {
                    // Transform data to Chart.js format
                    const labels = data.data.map((entry) => new Date(entry.time).toLocaleDateString());
                    const prices = data.data.map((entry) => parseFloat(entry.priceUsd));

                    setChartData({
                        labels: labels,
                        datasets: [
                            {
                                label: '가격 (USD)',
                                data: prices,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.3,
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error('차트 데이터 가져오기 오류:', error);
            }
        };

        fetchChartData();
    }, [coinName]);

    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                // Step 1: Fetch exchange rates
                const exchangeRateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!exchangeRateResponse.ok) {
                    throw new Error('환율 데이터를 가져오지 못했습니다.');
                }
                const exchangeRateData = await exchangeRateResponse.json();
                const exchangeRate = exchangeRateData.rates;

                // Step 2: Fetch current cryptocurrency price
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}`);
                if (!response.ok) {
                    throw new Error('데이터를 가져오지 못했습니다.');
                }
                const data = await response.json();
                const priceUsd = parseFloat(data?.data?.priceUsd);

                // Step 3: Convert price to KRW using exchange rate
                const krwExchangeRate = exchangeRate['KRW']; // Assuming 'KRW' is the key for Korean Won
                const priceInKRW = priceUsd * krwExchangeRate;

                setCurrentPrice(priceInKRW.toFixed(8)); // Format to 2 decimal places for KRW
            } catch (error) {
                console.error('현재 가격 가져오기 오류:', error);
            }
        };

        fetchCurrentPrice();
    }, [coinName]);

    useEffect(() => {
        // Fetch wallet balance from your local server
        const fetchWalletBalance = async () => {
            try {
                // Get user_key from localStorage
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // If in development environment, use local IP
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_money`, {
                    user_key,
                });

                if (response.data.valid) {
                    setWalletBalance(response.data.krw);
                } else {
                    console.log('잘못된 사용자 또는 사용자 키');
                }
            } catch (error) {
                console.error('지갑 잔액 가져오기 오류:', error);
            }
        };

        fetchWalletBalance();
    }, []);
    useEffect(() => {
        // Fetch number of coins owned
        const fetchOwnedCoins = async () => {
            try {
                // Get user_key from localStorage
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // If in development environment, use local IP
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_coins`, {
                    user_key,
                    coinName,
                });

                if (response.data.valid) {
                    setOwnedCoins(response.data.numberOfCoins.toFixed(8));
                } else {
                    setOwnedCoins(null);
                    console.log('해당 종류의 코인을 보유하지 않음');
                }
            } catch (error) {
                console.error('코인 수량 가져오기 오류:', error);
            }
        };

        fetchOwnedCoins();
    }, [coinName]);

    useEffect(() => {
        if (chartData) {
            const ctx = document.getElementById('coinChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: '날짜',
                            },
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: '가격 (USD)',
                            },
                        },
                    },
                },
            });
        }
    }, [chartData]);

    const handlePercentageClick = (percentage, actionType) => {
        // Calculate total amount and coins
        const totalAmount = (walletBalance * percentage) / 100;
        const coins = totalAmount / parseFloat(currentPrice);

        // Update state based on actionType
        if (actionType === 'buy') {
            if (totalAmount > walletBalance) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('잔액이 부족합니다.');
            } else {
                setNumberOfCoins(coins.toFixed(8)); // Convert to string with fixed decimals
                setTotalPurchasePrice(parseFloat(totalAmount.toFixed(2))); // Convert to number with fixed decimals
            }
        } else if (actionType === 'sell') {
            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('보유한 코인이 없습니다.');
                return;
            }
            // Calculate coins based on percentage of ownedCoins
            const coinsToSell = (parseFloat(ownedCoins) * percentage) / 100;
            setNumberOfCoins(coinsToSell.toFixed(8)); // Convert to string with fixed decimals
            const totalPrice = parseFloat(currentPrice) * coinsToSell;
            setTotalPurchasePrice(parseFloat(totalPrice.toFixed(2))); // Convert to number with fixed decimals
        }
    };

    const handleChange = (e) => {
        const coins = e.target.value;
        const totalPrice = parseFloat(currentPrice) * parseFloat(coins);

        // Update state
        if (totalPrice > walletBalance) {
            setNumberOfCoins('');
            setTotalPurchasePrice(0);
            alert('잔액이 부족합니다.');
        } else {
            setNumberOfCoins(coins);
            setTotalPurchasePrice(totalPrice); // Ensure totalPurchasePrice is a number
        }
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

        // Check if user has enough balance to make the purchase
        if (totalPrice > walletBalance) {
            alert('잔액이 부족합니다.');
            return;
        }

        try {
            // Get user_key from localStorage
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // If in development environment, use local IP
                baseURL = 'http://121.139.20.242:5011';
            }

            // Make API call to complete the purchase
            const response = await axios.post(`${baseURL}/api/buy_coins`, {
                user_key,
                coinName,
                numberOfCoins: parseFloat(numberOfCoins),
                totalPrice,
            });

            if (response.data.success) {
                alert('매수가 성공했습니다!');
                setWalletBalance(walletBalance - totalPrice);
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                window.location.reload();
            } else {
                alert('매수에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('매수 중 오류:', error);
            alert('매수 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleSell = async (e) => {
        e.preventDefault();

        try {
            // Get user_key from localStorage
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // If in development environment, use local IP
                baseURL = 'http://121.139.20.242:5011';
            }

            // Make API call to get the number of coins owned (already handled in useEffect)
            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                alert('보유한 코인이 없습니다.');
                return;
            }

            // Proceed with sell logic using numberOfCoins state
            const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

            // Check if user has enough coins to make the sale
            if (parseFloat(numberOfCoins) > parseFloat(ownedCoins)) {
                alert('보유한 코인이 부족합니다.');
                return;
            }

            // Make API call to complete the sale
            const response = await axios.post(`${baseURL}/api/sell_coins`, {
                user_key,
                coinName,
                numberOfCoins: parseFloat(numberOfCoins),
                totalPrice,
            });

            if (response.data.success) {
                alert('매도가 성공했습니다!');
                setWalletBalance(walletBalance + totalPrice);
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                window.location.reload();
            } else {
                alert('매도에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('매도 중 오류:', error);
            alert('매도 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const toggleBuyForm = () => {
        setShowBuyForm(!showBuyForm);
        setShowSellForm(false); // Hide sell form when toggling buy form
    };

    const toggleSellForm = () => {
        setShowSellForm(!showSellForm);
        setShowBuyForm(false); // Hide buy form when toggling sell form
    };

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.backButton}>
                <BackIcon className={styles.backIcon} />
            </Link>
            <h2>가격 차트</h2>
            <div className={styles.chartContainer}>
                <canvas id="coinChart" className={styles.canvas}></canvas>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.actionButton} onClick={toggleBuyForm}>
                    매수
                </button>
                <button className={styles.actionButton} onClick={toggleSellForm}>
                    매도
                </button>
            </div>
            {showBuyForm && (
                <div className={styles.formContainer}>
                    <h2>매수 : {coinName}</h2>
                    <p>코인 가격: {currentPrice} KRW</p>
                    <p>보유 금액: {walletBalance} KRW</p>
                    <form onSubmit={handleBuy}>
                        <label>
                            갯수를 입력하세요.:
                            <input
                                type="text"
                                value={numberOfCoins}
                                onChange={handleChange}
                                className={styles.buyCoinsInput}
                            />
                        </label>
                        <div className={styles.buttonGroup}>
                            <button type="button" onClick={() => handlePercentageClick(10, 'buy')}>
                                10% 매수
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(25, 'buy')}>
                                25% 매수
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(50, 'buy')}>
                                50% 매수
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(75, 'buy')}>
                                75% 매수
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(100, 'buy')}>
                                100% 매수
                            </button>
                        </div>
                        <p>
                            총 금액: {typeof totalPurchasePrice === 'number' ? totalPurchasePrice.toFixed(2) : '0.00'}{' '}
                            KRW
                        </p>
                        <button type="submit" className={styles.submitButton}>
                            매수
                        </button>
                    </form>
                </div>
            )}
            {showSellForm && (
                <div className={styles.formContainer}>
                    <h2>매도 : {coinName}</h2>
                    <p>코인 가격: {currentPrice} KRW</p>
                    <p>보유 코인: {ownedCoins ? ownedCoins : '0'}</p>
                    <form onSubmit={handleSell}>
                        <label>
                            갯수를 입력하세요.:
                            <input
                                type="text"
                                value={numberOfCoins}
                                onChange={handleChange}
                                className={styles.buyCoinsInput}
                            />
                        </label>
                        <div className={styles.buttonGroup}>
                            <button type="button" onClick={() => handlePercentageClick(10, 'sell')}>
                                10% 매도
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(25, 'sell')}>
                                25% 매도
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(50, 'sell')}>
                                50% 매도
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(75, 'sell')}>
                                75% 매도
                            </button>
                            <button type="button" onClick={() => handlePercentageClick(100, 'sell')}>
                                100% 매도
                            </button>
                        </div>
                        <p>
                            총 금액: {typeof totalPurchasePrice === 'number' ? totalPurchasePrice.toFixed(2) : '0.00'}{' '}
                            KRW
                        </p>
                        <button type="submit" className={styles.submitButton}>
                            매도
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
