import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

export default function BuyCoins() {
    const [chartData, setChartData] = useState(null);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [numberOfCoins, setNumberOfCoins] = useState('');
    const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0); // 지갑 잔액을 저장할 상태
    const [showBuyForm, setShowBuyForm] = useState(false); // 매수 폼을 토글할 상태
    const [showSellForm, setShowSellForm] = useState(false); // 매도 폼을 토글할 상태
    const [ownedCoins, setOwnedCoins] = useState(null); // 보유 코인을 저장할 상태
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const coinName = searchParams.get('coinName');
    const chartRef = useRef(null); // Chart 인스턴스를 저장할 ref

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`);
                if (!response.ok) {
                    throw new Error('데이터를 불러오는데 실패했습니다');
                }
                const data = await response.json();
                if (data?.data?.length > 0) {
                    // 데이터를 Chart.js 형식으로 변환
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
                console.error('차트 데이터를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchChartData();
    }, [coinName]);

    useEffect(() => {
        const fetchCurrentPrice = async () => {
            try {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinName}`);
                if (!response.ok) {
                    throw new Error('데이터를 불러오는데 실패했습니다');
                }
                const data = await response.json();
                setCurrentPrice(parseFloat(data?.data?.priceUsd).toFixed(8)); // 소수점 8자리로 포맷팅
            } catch (error) {
                console.error('현재 가격을 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchCurrentPrice();
    }, [coinName]);

    useEffect(() => {
        // 지갑 잔액을 서버에서 가져오기
        const fetchWalletBalance = async () => {
            try {
                // 로컬 스토리지에서 user_key 가져오기
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // 개발 환경에서 로컬 IP 사용
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_money`, {
                    user_key,
                });

                if (response.data.valid) {
                    setWalletBalance(response.data.krw);
                } else {
                    console.log('유효하지 않은 사용자 또는 사용자 키입니다');
                }
            } catch (error) {
                console.error('지갑 잔액을 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchWalletBalance();
    }, []);

    useEffect(() => {
        // 보유 코인 수를 서버에서 가져오기
        const fetchOwnedCoins = async () => {
            try {
                // 로컬 스토리지에서 user_key 가져오기
                const user_key = localStorage.getItem('user_key');
                if (!user_key) {
                    throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다');
                }

                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // 개발 환경에서 로컬 IP 사용
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
                    console.log('해당 유형의 보유 코인이 없습니다');
                }
            } catch (error) {
                console.error('보유 코인 수를 불러오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchOwnedCoins();
    }, [coinName]);

    useEffect(() => {
        if (chartData) {
            if (chartRef.current) {
                chartRef.current.destroy(); // 기존 Chart 인스턴스 삭제
            }
            const ctx = document.getElementById('coinChart').getContext('2d');
            chartRef.current = new Chart(ctx, {
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
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy(); // 컴포넌트 언마운트 시 Chart 인스턴스 삭제
            }
        };
    }, [chartData]);

    const handlePercentageClick = (percentage, actionType) => {
        // 총 금액과 코인 수 계산
        const totalAmount = (walletBalance * percentage) / 100;
        const coins = totalAmount / parseFloat(currentPrice);

        // actionType에 따라 상태 업데이트
        if (actionType === 'buy') {
            if (totalAmount > walletBalance) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('이 구매를 완료하기에 잔액이 부족합니다.');
            } else {
                setNumberOfCoins(coins.toFixed(8)); // 고정 소수점으로 변환
                setTotalPurchasePrice(parseFloat(totalAmount.toFixed(2))); // 고정 소수점으로 변환
            }
        } else if (actionType === 'sell') {
            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                alert('판매할 코인이 없습니다.');
                return;
            }
            // 보유 코인의 비율에 따른 코인 수 계산
            const coinsToSell = (parseFloat(ownedCoins) * percentage) / 100;
            setNumberOfCoins(coinsToSell.toFixed(8)); // 고정 소수점으로 변환
            const totalPrice = parseFloat(currentPrice) * coinsToSell;
            setTotalPurchasePrice(parseFloat(totalPrice.toFixed(2))); // 고정 소수점으로 변환
        }
    };

    const handleChange = (e) => {
        const coins = e.target.value;
        const totalPrice = parseFloat(currentPrice) * parseFloat(coins);

        // 상태 업데이트
        if (totalPrice > walletBalance) {
            setNumberOfCoins('');
            setTotalPurchasePrice(0);
            alert('이 구매를 완료하기에 잔액이 부족합니다.');
        } else {
            setNumberOfCoins(coins);
            setTotalPurchasePrice(totalPrice); // totalPurchasePrice가 숫자인지 확인
        }
    };

    const handleBuy = async (e) => {
        e.preventDefault();
        const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

        // 구매를 완료하기에 잔액이 충분한지 확인
        if (totalPrice > walletBalance) {
            alert('이 구매를 완료하기에 잔액이 부족합니다.');
            return;
        }

        try {
            // 로컬 스토리지에서 user_key 가져오기
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // 개발 환경에서 로컬 IP 사용
                baseURL = 'http://121.139.20.242:5011';
            }

            // API 호출을 통해 구매 완료
            const response = await axios.post(`${baseURL}/api/buy_coins`, {
                user_key,
                coinName,
                numberOfCoins: parseFloat(numberOfCoins),
                totalPrice,
            });

            if (response.data.success) {
                alert('구매 성공!');
                setWalletBalance(walletBalance - totalPrice);
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                window.location.reload();
            } else {
                alert('구매 실패. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('구매 중 오류가 발생했습니다:', error);
            alert('구매 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleSell = async (e) => {
        e.preventDefault();

        try {
            // 로컬 스토리지에서 user_key 가져오기
            const user_key = localStorage.getItem('user_key');
            if (!user_key) {
                throw new Error('로컬 스토리지에서 사용자 키를 찾을 수 없습니다');
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                // 개발 환경에서 로컬 IP 사용
                baseURL = 'http://121.139.20.242:5011';
            }

            // 보유 코인 수를 가져오기 위한 API 호출
            if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
                setNumberOfCoins('');
                alert('이 유형의 코인이 없습니다.');
                return;
            }

            // numberOfCoins 상태를 사용하여 판매 로직 진행
            const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

            // 판매를 완료하기에 충분한 코인이 있는지 확인
            if (parseFloat(numberOfCoins) > parseFloat(ownedCoins)) {
                alert('이 양의 코인을 판매할 충분한 코인이 없습니다.');
                return;
            }

            // 판매 완료를 위한 API 호출
            const response = await axios.post(`${baseURL}/api/sell_coins`, {
                user_key,
                coinName,
                numberOfCoins: parseFloat(numberOfCoins),
                totalPrice,
            });

            if (response.data.success) {
                alert('판매 성공!');
                setWalletBalance(walletBalance + totalPrice);
                setNumberOfCoins('');
                setTotalPurchasePrice(0);
                window.location.reload();
            } else {
                alert('판매 실패. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('판매 중 오류가 발생했습니다:', error);
            alert('판매 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const toggleBuyForm = () => {
        setShowBuyForm(!showBuyForm);
        setShowSellForm(false); // 매수 폼을 토글할 때 매도 폼 숨기기
    };

    const toggleSellForm = () => {
        setShowSellForm(!showSellForm);
        setShowBuyForm(false); // 매도 폼을 토글할 때 매수 폼 숨기기
    };

    return (
        <div>
            <h2>가격 차트</h2>
            <div>
                <canvas id="coinChart" width={600} height={400}></canvas>
            </div>
            <div>
                <button onClick={toggleBuyForm}>매수</button>
                <button onClick={toggleSellForm}>매도</button>
            </div>
            {showBuyForm && (
                <>
                    <h2>매수 : {coinName}</h2>
                    <p>코인 가격: ${currentPrice}</p>
                    <p>보유 금액: ${walletBalance}</p>
                    <form onSubmit={handleBuy}>
                        <label>
                            갯수를 입력하세요:
                            <input type="text" value={numberOfCoins} onChange={handleChange} />
                        </label>
                        <br />
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
                        <br />
                        <p>
                            총 금액: ${typeof totalPurchasePrice === 'number' ? totalPurchasePrice.toFixed(2) : '0.00'}
                        </p>
                        <br />
                        <button type="submit">매수</button>
                    </form>
                </>
            )}
            {showSellForm && (
                <>
                    <h2>매도 : {coinName}</h2>
                    <p>코인 가격: ${currentPrice}</p>
                    <p>보유 코인: {ownedCoins ? ownedCoins : '0'}</p>
                    <form onSubmit={handleSell}>
                        <label>
                            갯수를 입력하세요:
                            <input type="text" value={numberOfCoins} onChange={handleChange} />
                        </label>
                        <br />
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
                        <br />
                        <p>
                            총 금액: ${typeof totalPurchasePrice === 'number' ? totalPurchasePrice.toFixed(2) : '0.00'}
                        </p>
                        <br />
                        <button type="submit">매도</button>
                    </form>
                </>
            )}
        </div>
    );
}
