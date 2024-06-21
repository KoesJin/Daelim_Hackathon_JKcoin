import React from 'react';
import styles from '../../css/SettingsIcon/SettingsModal.module.css';
import { Link } from 'react-router-dom';

const SettingsModal = ({ onClose }) => {
    const handleLogout = () => {
        localStorage.removeItem('user_key');
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>설정</h2>
                <ul>
                    <Link to="/adminPage">
                        <li>관리자 페이지</li>
                    </Link>
                    <li>코인정보 다시 받기</li>
                    <li>관심코인 다시 받기</li>
                    <li>내 보유자산 표시</li>
                    <li>체결 시 반짝임</li>
                    <li>보유코인 탭</li>
                    <li>전일대비 등락 금액 표시</li>
                    <li>거래대금 KRW 환산 표시</li>
                    <li>코인상세(시세, 차트, 호가) 미리보기</li>
                    <li>신규 호가 반짝임</li>
                </ul>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    로그아웃
                </button>
                <button className={styles.closeButton} onClick={onClose}>
                    닫기
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
