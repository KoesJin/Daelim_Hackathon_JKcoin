import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyCoinPage() {
    const [coins, setCoins] = useState([]);
    const [totalMoney, setTotalMoney] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [profitLoss, setProfitLoss] = useState(0);

    useEffect(() => {
        // Fetch the user's funds
        const fetchFunds = async () => {
            const userKey = localStorage.getItem('user_key');
            if (!userKey) {
                console.error('user_key is missing in localStorage');
                return;
            }

            try {
                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // If in development environment, use local IP
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/key_money`, {
                    user_key: userKey,
                });
                if (response.data.valid) {
                    setTotalMoney(response.data.krw);
                } else {
                    console.error('Invalid user_key');
                }
            } catch (error) {
                console.error('펀드 데이터를 가져오는 중 오류가 발생했습니다:', error);
            }
        };

        // Fetch the user's coins data
        const fetchCoins = async () => {
            const userKey = localStorage.getItem('user_key');
            if (!userKey) {
                console.error('user_key is missing in localStorage');
                return;
            }

            try {
                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
                    // If in development environment, use local IP
                    baseURL = 'http://121.139.20.242:5011';
                }

                const response = await axios.post(`${baseURL}/api/user_coins`, {
                    user_key: userKey,
                });

                if (response.data.valid) {
                    const myCoins = response.data.coins;

                    const coinIds = myCoins.map((coin) => coin.coinName).join(',');
                    const coinResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                        params: {
                            vs_currency: 'krw',
                            ids: coinIds,
                        },
                    });

                    const coinData = coinResponse.data;

                    const updatedCoins = myCoins.map((myCoin) => {
                        const coinInfo = coinData.find((coin) => coin.id === myCoin.coinName);
                        const totalCoinsOwned = myCoin.totalPurchased - myCoin.totalSold;
                        const value = totalCoinsOwned * coinInfo.current_price;
                        const averagePurchasePrice = myCoin.totalPurchasePrice / myCoin.totalPurchased;
                        const profitLossPercent =
                            ((coinInfo.current_price - averagePurchasePrice) / averagePurchasePrice) * 100;
                        return {
                            ...myCoin,
                            numberOfCoins: totalCoinsOwned,
                            current_price: coinInfo.current_price,
                            value: value,
                            profit_loss: profitLossPercent,
                        };
                    });

                    const totalValue = updatedCoins.reduce((acc, coin) => acc + coin.value, 0);
                    const totalProfitLoss = updatedCoins.reduce(
                        (acc, coin) =>
                            acc + (coin.value - coin.numberOfCoins * (coin.totalPurchasePrice / coin.totalPurchased)),
                        0
                    );

                    setCoins(updatedCoins);
                    setTotalValue(totalValue);
                    setProfitLoss((totalProfitLoss / totalValue) * 100);
                } else {
                    console.error('Invalid user_key');
                }
            } catch (error) {
                console.error('코인 데이터를 가져오는 중 오류가 발생했습니다:', error);
            }
        };

        fetchFunds();
        fetchCoins();
    }, []);

    return (
        <div>
            <h1>내 코인 정보</h1>
            <div>
                <h2>
                    총 금액(KRW): {(totalMoney + totalValue).toFixed(0).toLocaleString()}
                    KRW
                </h2>
                <h2>보유 자산(KRW): {totalMoney.toFixed(0).toLocaleString()}KRW</h2>
                <h2>코인의 총 가치(KRW): {totalValue.toFixed(0).toLocaleString()}KRW</h2>
                <h2>총 손익: {profitLoss.toFixed(2)}%</h2>
            </div>
            <div>
                <h2>보유 코인</h2>
                <table>
                    <thead>
                        <tr>
                            <th>코인</th>
                            <th>수량</th>
                            <th>현재 가격</th>
                            <th>가치</th>
                            <th>손익 (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coins.map((coin) => (
                            <tr key={coin.coinName}>
                                <td>{coin.coinName}</td>
                                <td>{coin.numberOfCoins.toFixed(10)}</td>
                                <td>${coin.current_price.toFixed(2)}</td>
                                <td>${coin.value.toFixed(2)}</td>
                                <td>{coin.profit_loss.toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
