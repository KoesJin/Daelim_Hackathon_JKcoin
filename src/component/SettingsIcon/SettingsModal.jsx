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
                <h2 className={styles.modalTitle}>설정</h2>
                <ul className={styles.list}>
                    <li className={styles.listItem}>
                        <Link to="/adminPage" className={styles.link}>
                            관리자 페이지
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
                    <li className={styles.listItem}>
                        <Link to="a" className={styles.link}>
                            준비중입니다...
                        </Link>
                    </li>
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
