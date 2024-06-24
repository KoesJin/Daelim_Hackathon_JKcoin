import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from '../css/InvestmentsPage/Investments.module.css'; // CSS 파일을 import 합니다.

export default function Investments() {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    const fetchInvestmentsHistory = useCallback(async () => {
        try {
            const userKey = localStorage.getItem('user_key');
            if (!userKey) {
                setError('User key not found in local storage');
                return;
            }

            let baseURL = '';
            if (process.env.NODE_ENV === 'development') {
                baseURL = 'http://121.139.20.242:5011';
            }

            const response = await axios.post(`${baseURL}/api/history`, {
                user_key: userKey,
            });

            const formattedHistory = response.data.map((item) => ({
                ...item,
                date: formatDate(item.date),
                numberOfCoins: parseFloat(item.numberOfCoins).toFixed(8),
                totalPrice: parseFloat(item.totalPrice).toFixed(2),
            }));

            setHistory(formattedHistory);
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to fetch history');
        }
    }, []);

    useEffect(() => {
        fetchInvestmentsHistory();
    }, [fetchInvestmentsHistory]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const formattedDate = `${date.getFullYear().toString().slice(2)}.${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date
            .getHours()
            .toString()
            .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return formattedDate;
    };

    return (
        <>
            <div className={styles.container}>
                <h2 className={styles.title}>투자 내역</h2>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <div className={styles.investmentHistory}>
                    {history.map((item, index) => (
                        <div key={index} className={styles.historyItem}>
                            <p>거래 종류 : {item.type}</p>
                            <p>코인 이름 : {item.coinName}</p>
                            <p>매도/매수 가격 : {item.totalPrice}</p>
                            <p>매수/매도 수량 : {item.numberOfCoins}</p>
                            <p>매수/매도 합산 가격 : {(item.totalPrice * item.numberOfCoins).toFixed(8)}</p>
                            <p>매수/매도 날짜 : {item.date}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
