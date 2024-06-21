import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function BuyCoins() {
    const [chartData, setChartData] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numberOfCoins, setNumberOfCoins] = useState('');
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0); // State to hold wallet balance
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const coinName = searchParams.get('coinName');

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
                                label: 'Price (USD)',
                                data: prices,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                tension: 0.3,
                            },
                        ],
                    });
                }
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        fetchChartData();
    }, [coinName]);

    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setCurrentPrice(parseFloat(data?.data?.priceUsd).toFixed(8)); // Format to 8 decimal places
                setLoading(false); // Update loading state
            } catch (error) {
                console.error('Error fetching current price:', error);
            }
        };

        fetchCurrentPrice();
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
                                text: 'Date',
                            },
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Price (USD)',
                            },
                        },
                    },
                },
            });
        }
    }, [chartData]);
    useEffect(() => {
        // Fetch wallet balance from your local server
        const fetchWalletBalance = async () => {
            try {
                // Get user_key from localStorage
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('User key not found in localStorage');
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
                    console.log('Invalid user or user key');
                }
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
            }
        };

        fetchWalletBalance();
    }, []);

    useEffect(() => {
        if (currentPrice && numberOfCoins) {
            const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);
            setTotalPurchasePrice(totalPrice);
        } else {
            setTotalPurchasePrice(0);
        }
    }, [currentPrice, numberOfCoins]);

    const handlePercentageClick = (percentage) => {
        const totalAmount = (walletBalance * percentage) / 100;
        const coins = totalAmount / parseFloat(currentPrice);
        if (totalAmount > walletBalance) {
            setNumberOfCoins('');
            setTotalPurchasePrice(0);
            alert('Insufficient balance to make this purchase.');
        } else {
            setNumberOfCoins(coins.toFixed(8)); // Adjust the number of decimal places as needed
        }
    };

    const handleChange = (e) => {
        const coins = e.target.value;
        const totalPrice = parseFloat(currentPrice) * parseFloat(coins);
        if (totalPrice > walletBalance) {
            setNumberOfCoins('');
            setTotalPurchasePrice(0);
            alert('Insufficient balance to make this purchase.');
        } else {
            setNumberOfCoins(coins);
        }
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

        // Check if user has enough balance to make the purchase
        if (totalPrice > walletBalance) {
            alert('Insufficient balance to make this purchase.');
            return;
        }

        // Assuming you would now proceed with the purchase logic
        // You can add your API call or other logic here

        setTotalPurchasePrice(totalPrice);
        // 여기서 실제 매수 로직을 추가할 수 있음 (예: API 호출 등)
        // 예를 들어, 서버에 매수 요청을 보내거나 상태를 업데이트할 수 있음
        // 예: setNumberOfCoins(''); setTotalPurchasePrice(0); // 매수 후 필드 초기화
    };

    return (
        <div>
            <h2>Price Chart</h2>
            <div>
                <canvas id="coinChart" width={400} height={400}></canvas>
            </div>
            <h2>매수 : {coinName}</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <p>코인 가격: ${currentPrice}</p>
                    <p>보유 금액: ${walletBalance}</p>
                    <form onSubmit={handleBuy}>
                        <label>
                            갯수를 입력하세요.:
                            <input type="text" value={numberOfCoins} onChange={handleChange} />
                        </label>
                        <br />
                        <button type="button" onClick={() => handlePercentageClick(10)}>
                            10%
                        </button>
                        <button type="button" onClick={() => handlePercentageClick(25)}>
                            25%
                        </button>
                        <button type="button" onClick={() => handlePercentageClick(50)}>
                            50%
                        </button>
                        <button type="button" onClick={() => handlePercentageClick(75)}>
                            75%
                        </button>
                        <button type="button" onClick={() => handlePercentageClick(100)}>
                            100%
                        </button>
                        <br />
                        <p>총 금액: ${totalPurchasePrice.toFixed(8)}</p>
                        <br />
                        <button type="submit">매수</button>
                    </form>
                </>
            )}
        </div>
    );
}
