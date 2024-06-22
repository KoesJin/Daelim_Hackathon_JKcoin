import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Investments() {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    const fetchInvestmentsHistory = async () => {
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

            // Process date formatting here
            const formattedHistory = response.data.map((item) => ({
                ...item,
                date: formatDate(item.date), // Assuming item.date is already in a format Date can parse
            }));

            setHistory(formattedHistory);
        } catch (err) {
            console.error('Error fetching history:', err);
            setError('Failed to fetch history');
        }
    };

    useEffect(() => {
        fetchInvestmentsHistory(); // fetchInvestmentsHistory is now a dependency

        // Since fetchInvestmentsHistory does not change, it does not need to be included in the dependency array.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array because we want this effect to run only once on mount

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
        <div>
            <h2>Investments History</h2>

            {error && <p>{error}</p>}

            <h3>Investments History:</h3>
            <ul>
                {history.map((item, index) => (
                    <li key={index}>
                        <p>거래 종류 : {item.type}</p>
                        <p>코인 이름 : {item.coinName}</p>
                        <p>매도/매수 가격 : {item.numberOfCoins}</p>
                        <p>매수/매도 수량 : {(item.totalPrice * item.numberOfCoins).toFixed(8)}</p>
                        <p>매수/매도 합산 가격 : {item.totalPrice}</p>
                        <p>매수/매도 날짜 : {item.date}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
