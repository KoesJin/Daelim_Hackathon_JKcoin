import React, { useState, useEffect } from 'react';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg';
import { Link, useNavigate } from 'react-router-dom';

const ExChangePageMid = ({ exchangeRate, cryptoData, priceChanges }) => {
    const [activeTab, setActiveTab] = useState('KRW');
    const [previousData, setPreviousData] = useState([]);
    const navigate = useNavigate();
    if (!localStorage.getItem('user_key')) {
        navigate('/LoginPage');
    }
    if (localStorage.getItem('user_key') === 'null') {
        navigate('/LoginPage');
    }
    useEffect(() => {
        if (cryptoData && cryptoData.length > 0) {
            setPreviousData((prevData) => cryptoData.map((coin, index) => coin || prevData[index]));
        }
    }, [cryptoData]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const formatNumber = (number, decimals = 0) => {
        return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <div className={styles.content}>
            <div className={styles.searchBar}>
                <SearchIcon className={styles.searchIcon} />
                <input type="text" placeholder="코인명/심볼 검색" />
            </div>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'KRW' ? styles.active : ''}`}
                    onClick={() => handleTabClick('KRW')}
                >
                    KRW
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'USDT' ? styles.active : ''}`}
                    onClick={() => handleTabClick('USDT')}
                >
                    USDT
                </button>
                <button
                    className={`${styles.tab} ${activeTab === '관심' ? styles.active : ''}`}
                    onClick={() => handleTabClick('관심')}
                >
                    관심
                </button>
            </div>
            <div className={styles.exchangeTableContainer}>
                <table className={styles.exchangeTable}>
                    <thead>
                        <tr>
                            <th>코인 이름/코드</th>
                            <th>현재가</th>
                            <th>전일대비</th>
                            <th>거래 대금</th>
                        </tr>
                    </thead>
                    <tbody>
                        {previousData.map((coin, index) => {
                            if (!coin) return null;

                            const currentPrice = parseFloat(coin.priceUsd);
                            const changeType = priceChanges[coin.id]?.type || '';
                            const priceClass =
                                changeType === 'up' ? styles.priceUp : changeType === 'down' ? styles.priceDown : '';

                            return (
                                <tr key={index}>
                                    <td>
                                        <Link to={`/buycoins?coinName=${encodeURIComponent(coin.id)}`}>
                                            {coin.name} ({coin.symbol})
                                        </Link>
                                    </td>
                                    <td className={priceClass}>
                                        {activeTab === 'KRW'
                                            ? `${formatNumber(currentPrice * exchangeRate)}`
                                            : `${formatNumber(currentPrice, 2)}`}
                                    </td>
                                    <td
                                        className={
                                            parseFloat(coin.changePercent24Hr) > 0 ? styles.changeUp : styles.changeDown
                                        }
                                    >
                                        {parseFloat(coin.changePercent24Hr).toFixed(2)}%
                                    </td>
                                    <td>
                                        {activeTab === 'KRW'
                                            ? `${formatNumber(
                                                  (parseFloat(coin.volumeUsd24Hr) * exchangeRate) / 1000000
                                              )}백만`
                                            : `${formatNumber(parseFloat(coin.volumeUsd24Hr) / 1000000, 2)}`}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExChangePageMid;
