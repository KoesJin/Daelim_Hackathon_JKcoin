import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../css/MyCoinPage/MyCoinPage.module.css';

export default function MyCoinPage() {
    const [coins, setCoins] = useState([]);
    const [totalMoney, setTotalMoney] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [profitLoss, setProfitLoss] = useState(0);

    useEffect(() => {
        const fetchFunds = async () => {
            const userKey = localStorage.getItem('user_key');
            if (!userKey) {
                console.error('user_key is missing in localStorage');
                return;
            }

            try {
                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
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

        const fetchCoins = async () => {
            const userKey = localStorage.getItem('user_key');
            if (!userKey) {
                console.error('user_key is missing in localStorage');
                return;
            }

            try {
                let baseURL = '';
                if (process.env.NODE_ENV === 'development') {
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
                        const profitLossAmount = value - totalCoinsOwned * averagePurchasePrice;
                        return {
                            ...myCoin,
                            numberOfCoins: totalCoinsOwned,
                            current_price: coinInfo.current_price,
                            value: value,
                            profit_loss_percent: profitLossPercent,
                            profit_loss_amount: profitLossAmount,
                        };
                    });

                    const totalValue = updatedCoins.reduce((acc, coin) => acc + coin.value, 0);
                    const totalProfitLoss = updatedCoins.reduce((acc, coin) => acc + coin.profit_loss_amount, 0);
                    const totalInvestment = updatedCoins.reduce(
                        (acc, coin) => acc + coin.totalPurchased * (coin.totalPurchasePrice / coin.totalPurchased),
                        0
                    );
                    const totalProfitLossPercent = (totalProfitLoss / totalInvestment) * 100;

                    setCoins(updatedCoins);
                    setTotalValue(totalValue);
                    setProfitLoss(totalProfitLossPercent);
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

    const formatNumber = (number, decimals = 0) => {
        return number.toLocaleString('ko-KR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    };

    const getProfitLossClass = (value) => {
        return value >= 0 ? styles.profit : styles.loss;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>코인정보</div>
            </div>
            <div className={styles.searchBar}>
                <input type="text" placeholder="코인명/심볼 검색" className={styles.searchInput} />
            </div>
            <div className={styles.totalAssets}>
                <span>총 보유자산</span>
                <span>{formatNumber(totalMoney + totalValue, 0)} KRW</span>
            </div>
            <div className={styles.assetDetails}>
                <h2>보유 자산(KRW): {formatNumber(totalMoney, 0)} KRW</h2>
                <h2>코인의 총 가치(KRW): {formatNumber(totalValue, 0)} KRW</h2>
                <h2 className={getProfitLossClass(profitLoss)}>총 손익: {profitLoss.toFixed(2)}%</h2>
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
                            {coins.map((coin) => (
                                <tr key={coin.coinName}>
                                    <td>{coin.coinName}</td>
                                    <td>{formatNumber(coin.numberOfCoins, 3)}</td>
                                    <td>{formatNumber(coin.current_price, 2)} KRW</td>
                                    <td>{formatNumber(coin.value, 2)} KRW</td>
                                    <td className={getProfitLossClass(coin.profit_loss_percent)}>
                                        {coin.profit_loss_percent.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
