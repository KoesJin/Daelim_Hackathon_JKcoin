import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/Footer/Footer.module.css';

function Footer() {
    const [activeButton, setActiveButton] = useState('거래소');

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
                    to="/deposits"
                    className={`${styles.footerButton} ${activeButton === '입출금' ? styles.active : ''}`}
                    onClick={() => setActiveButton('입출금')}
                >
                    입출금
                </Link>
                <Link
                    to="/more"
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
