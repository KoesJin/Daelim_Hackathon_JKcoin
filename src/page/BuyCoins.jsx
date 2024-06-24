import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../css/BuyCoinsPage/BuyCoins.module.css';
import { ReactComponent as BackIcon } from '../svg/BuyCoinsPage/Back.svg';
import { ReactComponent as StarIcon } from '../svg/BuyCoinsPage/Star.svg';

export default function BuyCoins() {
    const [chartData, setChartData] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [numberOfCoins, setNumberOfCoins] = useState('');
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showBuyForm, setShowBuyForm] = useState(true);
    const [showSellForm, setShowSellForm] = useState(false);
    const [ownedCoins, setOwnedCoins] = useState(null);
    const [isStarred, setIsStarred] = useState(false); // State to toggle star icon color
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const coinName = searchParams.get('coinName')?.toLowerCase();

    const chartRef = useRef(null);
    const chartContainerRef = useRef(null);
    const buyPercentageButtonsRef = useRef([]);
    const sellPercentageButtonsRef = useRef([]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                if (data?.data?.length > 0) {
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
                const exchangeRateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
                if (!exchangeRateResponse.ok) {
                    throw new Error('환율 데이터를 가져오지 못했습니다.');
                }
                const exchangeRateData = await exchangeRateResponse.json();
                const exchangeRate = exchangeRateData.rates;

                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}`);
                if (!response.ok) {
                    throw new Error('데이터를 가져오지 못했습니다.');
                }
                const data = await response.json();
                const priceUsd = parseFloat(data?.data?.priceUsd);

                const krwExchangeRate = exchangeRate['KRW'];
                const priceInKRW = priceUsd * krwExchangeRate;

                setCurrentPrice(priceInKRW.toFixed(11));
            } catch (error) {
                console.error('현재 가격 가져오기 오류:', error);
            }
        };

        fetchCurrentPrice();
    }, [coinName]);

    useEffect(() => {
        const fetchWalletBalance = async () => {
            try {
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_money`, {
                    user_key,
                });

                if (response.data.valid) {
                    setWalletBalance(response.data.krw.toFixed(11));
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
        const fetchOwnedCoins = async () => {
            try {
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_coins`, {
                    user_key,
                    coinName,
                });

                if (response.data.valid) {
                    setOwnedCoins(response.data.numberOfCoins.toFixed(11));
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
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            const ctx = chartContainerRef.current.getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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

    const handlePercentageClick = (percentage, actionType, index) => {
        const totalAmount = (walletBalance * percentage) / 100;
        const coins = totalAmount / parseFloat(currentPrice);

        const updateActiveClass = (buttonsRef, activeIndex) => {
            buttonsRef.current.forEach((button, i) => {
                if (i === activeIndex) {
                    button.classList.add(styles.activeButton);
                } else {
                    button.classList.remove(styles.activeButton);
                }
            });
        };

        if (actionType === 'buy') {
            updateActiveClass(buyPercentageButtonsRef, index);
            if (totalAmount > walletBalance) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('잔액이 부족합니다.');
            } else {
                setNumberOfCoins(coins.toFixed(11));
                setTotalPurchasePrice(parseFloat(totalAmount.toFixed(11)));
            }
        } else if (actionType === 'sell') {
            updateActiveClass(sellPercentageButtonsRef, index);
            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('보유한 코인이 없습니다.');
                return;
            }
            const coinsToSell = (parseFloat(ownedCoins) * percentage) / 100;
            setNumberOfCoins(coinsToSell.toFixed(8));
            const totalPrice = parseFloat(currentPrice) * coinsToSell;
            setTotalPurchasePrice(parseFloat(totalPrice.toFixed(11)));
        }
    };

    const handleChange = (e) => {
        const coins = e.target.value;
        const totalPrice = parseFloat(currentPrice) * parseFloat(coins);

        if (totalPrice > walletBalance) {
            setNumberOfCoins('');
            setTotalPurchasePrice(0);
            alert('잔액이 부족합니다.');
        } else {
            setNumberOfCoins((coins - 0.00000000001).toFixed(11)); // Convert to string with fixed decimals
            setTotalPurchasePrice(totalPrice);
        }
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

        if (totalPrice > walletBalance) {
            alert('잔액이 부족합니다.');
            return;
        }

        try {
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                baseURL = 'http://121.139.20.242:5011';
            }

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
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다.');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                baseURL = 'http://121.139.20.242:5011';
            }

            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                alert('보유한 코인이 없습니다.');
                return;
            }

            const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

            if (parseFloat(numberOfCoins) > parseFloat(ownedCoins)) {
                alert('보유한 코인이 부족합니다.');
                return;
            }

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
        setShowBuyForm(true);
        setShowSellForm(false);
    };

    const toggleSellForm = () => {
        setShowSellForm(true);
        setShowBuyForm(false);
    };

    const toggleStar = () => {
        setIsStarred(!isStarred);
    };

    const formatNumber = (number) => {
        return Number(number).toLocaleString(undefined, { minimumFractionDigits: 11, maximumFractionDigits: 11 });
    };

    return (
        <div className={styles.container}>
            <Link to="/" className={styles.backButton}>
                <BackIcon className={styles.backIcon} />
            </Link>
            <button className={`${styles.starButton} ${isStarred ? styles.starred : ''}`} onClick={toggleStar}>
                <StarIcon className={styles.starIcon} />
            </button>
            <h2 className={styles.BuyCoin_h2}>가격 차트</h2>
            <div className={styles.chartContainer}>
                <canvas ref={chartContainerRef} id="coinChart" className={styles.canvas}></canvas>
            </div>
            <div className={styles.buttonContainer}>
                <button
                    className={`${styles.actionButton} ${showBuyForm ? styles.activeButton : ''}`}
                    onClick={toggleBuyForm}
                >
                    매수
                </button>
                <button
                    className={`${styles.actionButton} ${showSellForm ? styles.activeButton : ''}`}
                    onClick={toggleSellForm}
                >
                    매도
                </button>
            </div>
            {showBuyForm && (
                <div className={styles.formContainer}>
                    <h2 className={styles.BuyCoin_h2}>매수 : {coinName}</h2>
                    <p>코인 가격: {formatNumber(currentPrice)} KRW</p>
                    <p>보유 금액: {formatNumber(walletBalance)} KRW</p>
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
                            {[10, 25, 50, 75, 100].map((percentage, index) => (
                                <button
                                    key={percentage}
                                    type="button"
                                    ref={(el) => (buyPercentageButtonsRef.current[index] = el)}
                                    onMouseUp={() => handlePercentageClick(percentage, 'buy', index)}
                                    className={styles.percentageButton}
                                >
                                    {percentage}% 매수
                                </button>
                            ))}
                        </div>
                        <p>총 금액: {formatNumber(totalPurchasePrice)} KRW</p>
                        <button type="submit" className={styles.submitButton}>
                            매수
                        </button>
                    </form>
                </div>
            )}
            {showSellForm && (
                <div className={styles.formContainer}>
                    <h2 className={styles.BuyCoin_h2}>매도 : {coinName}</h2>
                    <p>코인 가격: {formatNumber(currentPrice)} KRW</p>
                    <p>보유 코인: {ownedCoins ? formatNumber(ownedCoins) : '0'}</p>
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
                            {[10, 25, 50, 75, 100].map((percentage, index) => (
                                <button
                                    key={percentage}
                                    type="button"
                                    ref={(el) => (sellPercentageButtonsRef.current[index] = el)}
                                    onMouseUp={() => handlePercentageClick(percentage, 'sell', index)}
                                    className={styles.percentageButton}
                                >
                                    {percentage}% 매도
                                </button>
                            ))}
                        </div>
                        <p>총 금액: {formatNumber(totalPurchasePrice)} KRW</p>
                        <button type="submit" className={styles.submitButton}>
                            매도
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
