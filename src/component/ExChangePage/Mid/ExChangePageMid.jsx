import React, { useState, useEffect } from 'react';
import styles from '../../../css/ExChangePage/Mid/ExChangePageMid.module.css';
import { ReactComponent as SearchIcon } from '../../../svg/ExChangePage/Mid/search-icon.svg';
import { Link, useNavigate } from 'react-router-dom';

const ExChangePageMid = ({ exchangeRate, cryptoData, priceChanges }) => {
    const [activeTab, setActiveTab] = useState('KRW');
    const [previousData, setPreviousData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    const formatNumber = (number, decimals = 0) => {
        return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const filteredData = previousData.filter(
        (coin) =>
            coin &&
            coin.name &&
            coin.symbol &&
            (coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className={styles.content}>
            <div className={styles.searchBar}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="코인명/심볼 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'KRW' ? styles.active : ''}`}
                    onClick={() => {
                        setActiveTab('KRW');
                    }}
                >
                    KRW
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'USDT' ? styles.active : ''}`}
                    onClick={() => {
                        setActiveTab('USDT');
                    }}
                >
                    USDT
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'favorites' ? styles.active : ''}`}
                    onClick={() => {
                        setActiveTab('favorites');
                        let currentValue = localStorage.getItem('favorites_fa');
                        if (!currentValue) {
                            // If currentValue is null (not set in localStorage), default to "1"
                            currentValue = '1';
                        } else {
                            // Toggle between "0" and "1"
                            currentValue = currentValue === '1' ? '0' : '1';
                        }
                        localStorage.setItem('favorites_fa', currentValue);
                        navigate('/');
                    }}
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
                        {filteredData.map((coin, index) => {
                            if (!coin) return null;

                            const currentPrice = parseFloat(coin.priceUsd);
                            const changePercent = parseFloat(coin.changePercent24Hr);
                            const changeType = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
                            const priceClass =
                                changeType === 'up'
                                    ? styles.priceUp
                                    : changeType === 'down'
                                    ? styles.priceDown
                                    : styles.priceNeutral;
                            const changeClass =
                                changeType === 'up'
                                    ? styles.changeUp
                                    : changeType === 'down'
                                    ? styles.changeDown
                                    : styles.changeNeutral;
                            return (
                                <tr key={`${coin.id}-${priceChanges[coin.id]?.type}`}>
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
                                    <td className={changeClass}>{changePercent.toFixed(2)}%</td>
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
