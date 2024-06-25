import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from '../css/InvestmentsPage/Investments.module.css'; // CSS 파일을 import 합니다.
import { ReactComponent as SettingsIcon } from '../svg/ExChangePage/Header/settings.svg';
import { useNavigate, useOutletContext } from 'react-router-dom';
import SettingsModal from '../component/SettingsIcon/SettingsModal';

export default function Investments() {
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    if (!localStorage.getItem('user_key')) {
        navigate('/LoginPage');
    }
    if (localStorage.getItem('user_key') === 'null') {
        navigate('/LoginPage');
    }
    const { isModalOpen, setIsModalOpen } = useOutletContext();

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

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
                <div className={styles.header}>
                    <div className={styles.title}>투자내역</div>
                    <SettingsIcon className={styles.icon} onClick={openModal} />
                </div>

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
            {isModalOpen && <SettingsModal onClose={closeModal} />}
        </>
    );
}
