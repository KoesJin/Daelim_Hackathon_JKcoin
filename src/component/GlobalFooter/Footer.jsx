import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../css/Footer/Footer.module.css';

function Footer() {
    const location = useLocation();
    const [activeButton, setActiveButton] = useState('');

    useEffect(() => {
        // URL 경로를 기반으로 activeButton 상태 설정
        switch (location.pathname) {
            case '/':
                setActiveButton('거래소');
                break;
            case '/mycoinpage':
                setActiveButton('코인정보');
                break;
            case '/investments':
                setActiveButton('투자내역');
                break;
            case '/cointrend':
                setActiveButton('코인동향');
                break;
            case '/seemore':
                setActiveButton('더보기');
                break;
            default:
                setActiveButton('');
        }
    }, [location.pathname]);

    return (
        <footer className={styles.footerContainer}>
            <div className={styles.footer}>
                <Link
                    to="/"
                    className={`${styles.footerButton} ${activeButton === '거래소' ? styles.active : ''}`}
                    onClick={() => setActiveButton('거래소')}
                >
                    거래소
                </Link>
                <Link
                    to="/mycoinpage"
                    className={`${styles.footerButton} ${activeButton === '코인정보' ? styles.active : ''}`}
                    onClick={() => setActiveButton('코인정보')}
                >
                    코인정보
                </Link>
                <Link
                    to="/investments"
                    className={`${styles.footerButton} ${activeButton === '투자내역' ? styles.active : ''}`}
                    onClick={() => setActiveButton('투자내역')}
                >
                    투자내역
                </Link>
                <Link
                    to="/cointrend"
                    className={`${styles.footerButton} ${activeButton === '코인동향' ? styles.active : ''}`}
                    onClick={() => setActiveButton('코인동향')}
                >
                    코인동향
                </Link>
                <Link
                    to="/seemore"
                    className={`${styles.footerButton} ${activeButton === '더보기' ? styles.active : ''}`}
                    onClick={() => setActiveButton('더보기')}
                >
                    더보기
                </Link>
            </div>
        </footer>
    );
}

export default Footer;
